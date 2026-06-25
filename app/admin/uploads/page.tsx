"use client"

import { Textarea } from "@/components/ui/textarea"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Shield,
  FileImage,
  Search,
  Upload,
  HardDrive,
  Clock,
  CheckCircle,
  Grid3x3,
  List,
  Download,
  X,
  FolderPlus,
  Edit,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileCard } from "@/components/uploads/file-card"
import { CategoryBuilderModal } from "@/components/category-builder-modal"
import { notifyStorageUsageUpdated } from "@/lib/storage-usage-events"

interface UploadType {
  _id: string
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  publicUrl: string
  status: string
  tags: string[]
  title?: string
  description?: string
  portfolioCategory?: {
    _id: string
    name: string
    slug: string
  }
  createdAt: string
  uploadedBy: {
    _id: string
    name: string
    email: string
  }
}

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  parentCategoryId?: string | null
}

interface EditFormData {
  title: string
  description: string
  tags: string
  portfolioCategory: string
  hdPrice?: string
  sdPrice?: string
}

export default function AdminUploadsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [uploads, setUploads] = useState<UploadType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    processing: 0,
    totalSize: 0,
  })
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isCategoryBuilderOpen, setIsCategoryBuilderOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedUpload, setSelectedUpload] = useState<UploadType | null>(null)
  const [editingUpload, setEditingUpload] = useState<UploadType | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    description: "",
    tags: "",
    portfolioCategory: "",
    hdPrice: "0",
    sdPrice: "0",
  })

  const [uploadCategory, setUploadCategory] = useState<string>("")
  const [uploadHdPrice, setUploadHdPrice] = useState<string>("")
  const [uploadSubCategoryPrices, setUploadSubCategoryPrices] = useState<Record<string, string>>({})
  const [uploadSubCategoryFiles, setUploadSubCategoryFiles] = useState<Record<string, FileList | null>>({})

  const rootCategories = categories.filter((cat) => !cat.parentCategoryId)
  const getSubCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parentCategoryId === parentId)
  }
  const selectedCategory = categories.find((cat) => cat._id === uploadCategory)
  const categorySubCats = selectedCategory ? getSubCategories(selectedCategory._id) : []
  const hasSubCategories = categorySubCats.length > 0

  useEffect(() => {
    fetchUploads()
    fetchCategories()
  }, [searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/portfolio-categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchUploads = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/uploads?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUploads(data.uploads)

        const total = data.uploads.length
        const processed = data.uploads.filter((u: UploadType) => u.status === "processed").length
        const processing = data.uploads.filter((u: UploadType) => u.status === "processing").length
        const totalSize = data.uploads.reduce((sum: number, u: UploadType) => sum + u.fileSize, 0)

        setStats({ total, processed, processing, totalSize })
      }
    } catch (error) {
      console.error("Failed to fetch uploads:", error)
      toast({
        title: "Error",
        description: "Failed to load uploads.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    // This function is now handled by CategoryBuilderModal
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? This action cannot be undone. Sub-categories will become independent.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/portfolio-categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully.",
        })
        notifyStorageUsageUpdated()
        fetchCategories()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete category.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async () => {
    if (!uploadCategory) {
      toast({
        title: "Error",
        description: "Please select a category.",
        variant: "destructive",
      })
      return
    }

    if (hasSubCategories) {
      let hasFiles = false
      for (const subCatId of Object.keys(uploadSubCategoryFiles)) {
        if (uploadSubCategoryFiles[subCatId]?.length) {
          hasFiles = true
          break
        }
      }

      if (!hasFiles) {
        toast({
          title: "Error",
          description: "Please select at least one file for a sub-category.",
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      try {
        for (const subCatId of categorySubCats.map((s) => s._id)) {
          const files = uploadSubCategoryFiles[subCatId]
          if (!files?.length) continue

          const price = uploadSubCategoryPrices[subCatId] || "0"

          for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("portfolioCategory", subCatId)
            formData.append("hdPrice", price)

            const response = await fetch("/api/admin/uploads", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`Failed to upload ${file.name}`)
            }
          }
        }

        toast({
          title: "Success",
          description: "Files uploaded successfully.",
        })

        notifyStorageUsageUpdated()
        resetUploadForm()
        setIsUploadDialogOpen(false)
        fetchUploads()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload files.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    } else {
      if (!selectedFiles?.length) {
        toast({
          title: "Error",
          description: "Please select at least one file.",
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      try {
        for (const file of Array.from(selectedFiles)) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("portfolioCategory", uploadCategory)
          formData.append("hdPrice", uploadHdPrice || "0")

          const response = await fetch("/api/admin/uploads", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }
        }

        toast({
          title: "Success",
          description: "Files uploaded successfully.",
        })

        notifyStorageUsageUpdated()
        resetUploadForm()
        setIsUploadDialogOpen(false)
        fetchUploads()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload files.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    }
  }

  const handleEditUpload = (upload: UploadType) => {
    setEditingUpload(upload)
    setEditFormData({
      title: upload.title || "",
      description: upload.description || "",
      tags: upload.tags.join(", "),
      portfolioCategory: upload.portfolioCategory?._id || "",
    })
    setIsCategoryDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUpload) return

    try {
      const portfolioCategory = editSelectedSubCategory || editFormData.portfolioCategory || null
      const response = await fetch(`/api/admin/uploads/${editingUpload._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          tags: editFormData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          portfolioCategory: portfolioCategory,
          hdPrice: parseFloat(editFormData.hdPrice || "0"),
          sdPrice: parseFloat(editFormData.sdPrice || "0"),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Upload updated successfully.",
        })
        setIsCategoryDialogOpen(false)
        setEditingUpload(null)
        setEditSelectedSubCategory("")
        fetchUploads()
      } else {
        toast({
          title: "Error",
          description: "Failed to update upload.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update upload.",
        variant: "destructive",
      })
    }
  }

  const handleViewUpload = (upload: UploadType) => {
    setSelectedUpload(upload)
  }

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadQuality, setDownloadQuality] = useState<"sd" | "hd" | null>(null)
  const [uploadForDownload, setUploadForDownload] = useState<UploadType | null>(null)

  const handleDownloadUpload = async (upload: UploadType, quality?: "sd" | "hd") => {
    if (!quality) {
      setUploadForDownload(upload)
      setDownloadDialogOpen(true)
      return
    }

    try {
      // Check if quality is available
      const extendedUpload = upload as any
      if (quality === "sd" && !extendedUpload.sdPublicUrl) {
        toast({
          title: "Error",
          description: "SD quality is not available for this file.",
          variant: "destructive",
        })
        return
      }

      const url = quality === "sd" ? extendedUpload.sdPublicUrl : upload.publicUrl

      if (!url) {
        toast({
          title: "Error",
          description: `${quality.toUpperCase()} file URL not found.`,
          variant: "destructive",
        })
        return
      }

      // Use server-side download proxy to avoid CORS issues
      const downloadResponse = await fetch(`/api/admin/downloads/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId: upload._id,
          quality: quality,
          fileName: upload.originalName,
        }),
      })

      if (!downloadResponse.ok) {
        let errorMessage = "Failed to download file"
        try {
          const contentType = downloadResponse.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const errorData = await downloadResponse.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const text = await downloadResponse.text()
            errorMessage = text.substring(0, 200)
          }
        } catch (e) {
          errorMessage = `Server error (${downloadResponse.status})`
        }
        throw new Error(errorMessage)
      }

      // Check if response is JSON (error) or binary (success)
      const contentType = downloadResponse.headers.get("content-type")
      
      if (contentType?.includes("application/json")) {
        // This is a JSON response with download URL
        const proxyData = await downloadResponse.json()
        const { downloadUrl, fileName } = proxyData

        if (!downloadUrl) {
          throw new Error("No download URL returned from server")
        }

        // Create a new fetch for the actual download
        const fileResponse = await fetch(downloadUrl, {
          method: "GET",
        })

        if (!fileResponse.ok) {
          throw new Error(`Download failed with status: ${fileResponse.status}`)
        }

        const blob = await fileResponse.blob()

        if (blob.size === 0) {
          throw new Error("Downloaded file is empty")
        }

        const objUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          window.URL.revokeObjectURL(objUrl)
        }, 100)
      } else {
        // This is the actual file stream
        const blob = await downloadResponse.blob()

        if (blob.size === 0) {
          throw new Error("Downloaded file is empty")
        }

        const fileName = downloadResponse.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || upload.originalName

        const objUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          window.URL.revokeObjectURL(objUrl)
        }, 100)
      }

      toast({
        title: "Success",
        description: `${quality.toUpperCase()} file downloaded successfully.`,
      })
      setDownloadDialogOpen(false)
      setUploadForDownload(null)
    } catch (error) {
      console.error("[v0] Download error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [uploadForDelete, setUploadForDelete] = useState<UploadType | null>(null)
  const [deleteQuality, setDeleteQuality] = useState<"sd" | "hd" | "both">("both")
  const [editSelectedSubCategory, setEditSelectedSubCategory] = useState<string>("")

  interface ExtendedUploadType extends UploadType {
    sdPublicUrl?: string
    sdFileSize?: number
  }

  const handleDeleteUpload = async (id: string) => {
    const upload = uploads.find((u) => u._id === id)
    if (!upload) return

    setUploadForDelete(upload)
    setDeleteQuality("both")
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!uploadForDelete) return

    setDeleteDialogOpen(false)
    try {
      const response = await fetch(`/api/admin/uploads/${uploadForDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleteQuality: deleteQuality,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "File deleted successfully.",
        })
        notifyStorageUsageUpdated()
        fetchUploads()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      })
    }
  }

  const handleRenameUpload = async (id: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/uploads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalName: newName,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "File renamed successfully.",
        })
        fetchUploads()
      } else {
        throw new Error("Failed to rename file")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename file.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    toast({
      title: "Admin signed out",
      description: "You have been signed out of the admin panel.",
    })
    await signOut({ callbackUrl: "/" })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getParentCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId)
    return cat?.name || "Unknown"
  }

  const resetUploadForm = () => {
    setUploadCategory("")
    setUploadHdPrice("")
    setSelectedFiles(null)
    setUploadSubCategoryPrices({})
    setUploadSubCategoryFiles({})
  }

  const handleManageCategories = () => {
    setIsCategoryBuilderOpen(true)
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          role: session.user?.role,
        }}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role,
          }}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
              <p className="text-muted-foreground">Upload and manage portfolio media files</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleManageCategories}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Upload HD images or videos. SD versions will be auto-generated for images.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Portfolio Category *</Label>
                      <Select
                        value={uploadCategory}
                        onValueChange={(value) => {
                          setUploadCategory(value)
                          setUploadSubCategoryPrices({})
                          setUploadSubCategoryFiles({})
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {rootCategories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {uploadCategory && (
                      <>
                        {hasSubCategories ? (
                          <div className="space-y-4">
                            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm">
                              <p className="text-blue-700 font-medium mb-1">Sub-categories Detected</p>
                              <p className="text-blue-600 text-xs">Configure price and upload files for each sub-category separately</p>
                            </div>

                            {categorySubCats.map((subCat, index) => (
                              <Card key={subCat._id} className="p-4 bg-muted/30 border-muted-foreground/20">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                                          {index + 1}
                                        </span>
                                        <h4 className="font-semibold text-foreground">{subCat.name}</h4>
                                      </div>
                                      {subCat.description && (
                                        <p className="text-xs text-muted-foreground ml-8">{subCat.description}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`price-${subCat._id}`} className="text-xs font-medium">
                                        Price (₦)
                                      </Label>
                                      <Input
                                        id={`price-${subCat._id}`}
                                        type="number"
                                        placeholder="0"
                                        value={uploadSubCategoryPrices[subCat._id] || ""}
                                        onChange={(e) =>
                                          setUploadSubCategoryPrices({
                                            ...uploadSubCategoryPrices,
                                            [subCat._id]: e.target.value,
                                          })
                                        }
                                        className="h-9 text-sm bg-background"
                                      />
                                      <p className="text-xs text-muted-foreground">0 = Free</p>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor={`files-${subCat._id}`} className="text-xs font-medium">
                                        Files
                                      </Label>
                                      <input
                                        id={`files-${subCat._id}`}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={(e) =>
                                          setUploadSubCategoryFiles({
                                            ...uploadSubCategoryFiles,
                                            [subCat._id]: e.currentTarget.files,
                                          })
                                        }
                                        className="h-9 text-xs file:text-xs"
                                      />
                                    </div>
                                  </div>

                                  {uploadSubCategoryFiles[subCat._id]?.length && (
                                    <div className="mt-2 p-2 bg-green-500/10 rounded text-xs text-green-700 font-medium">
                                      ✓ {uploadSubCategoryFiles[subCat._id]?.length} file(s) selected
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="price">HD Download Price (₦ Naira)</Label>
                              <Input
                                id="price"
                                type="number"
                                placeholder="0 (Free if empty)"
                                value={uploadHdPrice}
                                onChange={(e) => setUploadHdPrice(e.target.value)}
                                className="bg-foreground/5"
                              />
                              <p className="text-xs text-muted-foreground">
                                Set a price in Naira (₦) for HD downloads. SD downloads are always free. Leave empty for
                                free HD downloads.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="files">Select Files</Label>
                              <input
                                id="files"
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => setSelectedFiles(e.currentTarget.files)}
                                className="w-full"
                              />
                              {selectedFiles?.length && (
                                <p className="text-xs text-green-600">{selectedFiles.length} file(s) selected</p>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={uploading || !uploadCategory}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.processed}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.processing}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? "..." : formatFileSize(stats.totalSize)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="size-desc">Largest First</SelectItem>
                    <SelectItem value="size-asc">Smallest First</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploads Grid/List */}
          <Card>
            <CardHeader>
              <CardTitle>All Files</CardTitle>
              <CardDescription>
                {uploads.length} file{uploads.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading uploads...</p>
                </div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-12">
                  <FileImage className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No files found</h3>
                  <p className="text-muted-foreground mb-4">Upload your first file to get started.</p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                      : "space-y-2"
                  }
                >
                  {uploads.map((upload) => (
                    <div key={upload._id} className="relative group">
                      <FileCard
                        upload={upload}
                        onView={handleViewUpload}
                        onDownload={handleDownloadUpload}
                        onDelete={handleDeleteUpload}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditUpload(upload)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {upload.portfolioCategory && (
                        <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                          {upload.portfolioCategory.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Dialog */}
          <Dialog open={selectedUpload !== null} onOpenChange={() => setSelectedUpload(null)}>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 flex items-center justify-center">
              {selectedUpload && (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                    onClick={() => setSelectedUpload(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>

                  <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                    {selectedUpload.fileType.startsWith("video/") ? (
                      <video src={selectedUpload.sdPublicUrl || selectedUpload.publicUrl} controls className="w-full h-full object-contain" onError={() => {
                        console.warn(`Failed to load video: ${selectedUpload.publicUrl}`)
                      }} />
                    ) : (
                      <img
                        src={selectedUpload.sdPublicUrl || selectedUpload.publicUrl || "/placeholder.svg"}
                        alt={selectedUpload.originalName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.src = "/placeholder.svg"
                        }}
                      />
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 z-10"
                    onClick={() => handleDownloadUpload(selectedUpload)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <div className="absolute bottom-4 left-4 z-10 text-white">
                    <p className="text-sm font-medium">{selectedUpload.originalName}</p>
                    <p className="text-xs text-white/70">{formatFileSize(selectedUpload.fileSize)}</p>
                    {selectedUpload.portfolioCategory && (
                      <p className="text-xs text-primary mt-1">{selectedUpload.portfolioCategory.name}</p>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Upload Dialog */}
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit File</DialogTitle>
                <DialogDescription>
                  Manage file details and metadata
                </DialogDescription>
              </DialogHeader>

              {editingUpload && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-filename">File Name</Label>
                    <Input
                      id="edit-filename"
                      value={editFormData.title || editingUpload.originalName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Wedding-2024-01.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Original: {editingUpload.originalName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Display Title</Label>
                    <Input
                      id="edit-title"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Display title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="File description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Portfolio Category *</Label>
                    <Select
                      value={editFormData.portfolioCategory}
                      onValueChange={(value) => {
                        setEditFormData({
                          ...editFormData,
                          portfolioCategory: value,
                        })
                        setEditSelectedSubCategory("")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((cat) => !cat.parentCategoryId)
                          .map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editFormData.portfolioCategory && getSubCategories(editFormData.portfolioCategory).length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-subcategory">Sub-Category *</Label>
                      <Select
                        value={editSelectedSubCategory}
                        onValueChange={setEditSelectedSubCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSubCategories(editFormData.portfolioCategory).map((subCat) => (
                            <SelectItem key={subCat._id} value={subCat._id}>
                              {subCat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-sd-price">SD Quality Price</Label>
                      <Input
                        id="edit-sd-price"
                        type="number"
                        value={editFormData.sdPrice || "0"}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            sdPrice: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-hd-price">HD Quality Price</Label>
                      <Input
                        id="edit-hd-price"
                        type="number"
                        value={editFormData.hdPrice || "0"}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            hdPrice: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                    <Input
                      id="edit-tags"
                      value={editFormData.tags}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          tags: e.target.value,
                        })
                      }
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="bg-muted p-3 rounded text-sm">
                    <p className="text-muted-foreground">
                      <strong>File Size:</strong> {formatFileSize(editingUpload.fileSize)}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Type:</strong> {editingUpload.fileType}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Uploaded:</strong> {new Date(editingUpload.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (editingUpload) {
                      handleDeleteUpload(editingUpload._id)
                      setIsCategoryDialogOpen(false)
                    }
                  }}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>

      {/* Download Quality Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download File</DialogTitle>
            <DialogDescription>
              Select the quality you want to download
            </DialogDescription>
          </DialogHeader>

          {uploadForDownload && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">{uploadForDownload.originalName}</p>

              <div className="grid grid-cols-2 gap-3">
                {uploadForDownload.sdPublicUrl && (
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start py-3 bg-transparent"
                    onClick={() => handleDownloadUpload(uploadForDownload, "sd")}
                  >
                    <span className="font-semibold">SD Quality</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadForDownload.sdFileSize || 0)}
                    </span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-auto flex-col items-start py-3 bg-transparent"
                  onClick={() => handleDownloadUpload(uploadForDownload, "hd")}
                >
                  <span className="font-semibold">HD Quality</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(uploadForDownload.fileSize)}
                  </span>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quality Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Choose what version(s) of this file to delete
            </DialogDescription>
          </DialogHeader>

          {uploadForDelete && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm font-medium">{uploadForDelete.originalName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This action cannot be undone
                </p>
              </div>

              <div className="space-y-2">
                <Label>What do you want to delete?</Label>
                <div className="space-y-2">
                  {uploadForDelete.sdPublicUrl && (
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="deleteQuality"
                        value="sd"
                        checked={deleteQuality === "sd"}
                        onChange={(e) => setDeleteQuality(e.target.value as any)}
                      />
                      <div>
                        <p className="text-sm font-medium">SD Quality Only</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadForDelete.sdFileSize || 0)}
                        </p>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name="deleteQuality"
                      value="hd"
                      checked={deleteQuality === "hd"}
                      onChange={(e) => setDeleteQuality(e.target.value as any)}
                    />
                    <div>
                      <p className="text-sm font-medium">HD Quality Only</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadForDelete.fileSize)}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name="deleteQuality"
                      value="both"
                      checked={deleteQuality === "both"}
                      onChange={(e) => setDeleteQuality(e.target.value as any)}
                    />
                    <div>
                      <p className="text-sm font-medium">Both (Delete completely)</p>
                      <p className="text-xs text-muted-foreground">
                        Total: {formatFileSize((uploadForDelete.sdFileSize || 0) + uploadForDelete.fileSize)}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Builder Modal */}
      <CategoryBuilderModal
        open={isCategoryBuilderOpen}
        onOpenChange={setIsCategoryBuilderOpen}
        onSuccess={fetchCategories}
      />
    </div>
  )
}
