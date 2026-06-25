export const STORAGE_USAGE_UPDATED_EVENT = "storage-usage-updated"

export function notifyStorageUsageUpdated(): void {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(STORAGE_USAGE_UPDATED_EVENT))
}
