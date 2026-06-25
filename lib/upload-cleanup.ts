import mongoose from "mongoose"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { deleteFromR2 } from "@/lib/r2-storage"
import Gallery from "@/models/Gallery"
import Like from "@/models/Like"
import SavedMedia from "@/models/SavedMedia"
import Upload, { type IUpload } from "@/models/Upload"
import UserActivity from "@/models/UserActivity"
import ViewHistory from "@/models/ViewHistory"

type StorageType = "r2" | "local"

function getStorageType(upload: IUpload): StorageType {
  const metadata = upload.metadata as { storageType?: StorageType } | undefined
  return metadata?.storageType === "r2" ? "r2" : "local"
}

async function deleteStoredAsset(key: string, bucket: string, storageType: StorageType): Promise<void> {
  if (storageType === "r2") {
    await deleteFromR2(key, bucket)
    return
  }

  const filePath = path.join(process.cwd(), "public", "uploads", key)
  if (existsSync(filePath)) {
    await unlink(filePath)
  }
}

export async function deleteUploadAssets(upload: IUpload): Promise<void> {
  const storageType = getStorageType(upload)

  await deleteStoredAsset(upload.storageKey, upload.bucket, storageType)

  if (upload.sdStorageKey) {
    await deleteStoredAsset(upload.sdStorageKey, upload.bucket, storageType)
  }
}

export async function deleteUploadAssetsBatch(uploads: IUpload[]): Promise<void> {
  for (const upload of uploads) {
    await deleteUploadAssets(upload)
  }
}

export async function deleteUploadRecordsByIds(
  uploadIds: mongoose.Types.ObjectId[],
  session: mongoose.ClientSession,
): Promise<void> {
  if (uploadIds.length === 0) {
    return
  }

  await SavedMedia.deleteMany({ upload: { $in: uploadIds } }, { session })
  await Like.deleteMany({ upload: { $in: uploadIds } }, { session })
  await ViewHistory.deleteMany({ uploadId: { $in: uploadIds } }, { session })
  await UserActivity.deleteMany({ relatedId: { $in: uploadIds } }, { session })
  await Gallery.updateMany({ uploads: { $in: uploadIds } }, { $pull: { uploads: { $in: uploadIds } } }, { session })
  await Upload.deleteMany({ _id: { $in: uploadIds } }, { session })
}

function isTransientTransactionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const errorWithLabels = error as Error & { errorLabelSet?: Set<string>; code?: number }
  return errorWithLabels.errorLabelSet?.has("TransientTransactionError") === true || errorWithLabels.code === 112
}

export async function runTransactionWithRetry(
  operation: (session: mongoose.ClientSession) => Promise<void>,
  maxRetries = 3,
): Promise<void> {
  let attempt = 0

  while (attempt < maxRetries) {
    const session = await mongoose.startSession()

    try {
      session.startTransaction()
      await operation(session)
      await session.commitTransaction()
      return
    } catch (error) {
      await session.abortTransaction()
      attempt += 1

      if (!isTransientTransactionError(error) || attempt >= maxRetries) {
        throw error
      }
    } finally {
      await session.endSession()
    }
  }
}

export async function deleteUploadsWithReferences(uploads: IUpload[]): Promise<void> {
  await deleteUploadAssetsBatch(uploads)

  const uploadIds = uploads.map((upload) => upload._id as mongoose.Types.ObjectId)
  await runTransactionWithRetry(async (session) => {
    await deleteUploadRecordsByIds(uploadIds, session)
  })
}

export async function deleteUploadWithReferences(upload: IUpload): Promise<void> {
  await deleteUploadsWithReferences([upload])
}
