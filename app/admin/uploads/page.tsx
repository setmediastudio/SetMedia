"use client"

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
  Plus,
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
import { Textarea } from "@/components/ui/textarea"

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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedUpload, setSelectedUpload] = useState<UploadType | null>(null)
  const [editingUpload, setEditingUpload] = useState<UploadType | null>(null)

  const [uploadCategory, setUploadCategory] = useState<string>("")
  const [uploadHdPrice, setUploadHdPrice] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    tags: "",
    portfolioCategory: "",
  })

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
        console.log("[v0] Fetched uploads:", data.uploads.slice(0, 2))
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
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/portfolio-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDescription,
          order: categories.length,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully.",
        })
        setIsCategoryDialogOpen(false)
        setNewCategoryName("")
        setNewCategoryDescription("")
        fetchCategories()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create category.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      })
    }
  }

  const handleUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload.",
        variant: "destructive",
      })
      return
    }

    if (!uploadCategory) {
      toast({
        title: "Error",
        description: "Please select a portfolio category.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    let successCount = 0

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData()
        formData.append("file", selectedFiles[i])
        formData.append("portfolioCategory", uploadCategory)
        if (uploadHdPrice) {
          formData.append("hdPrice", uploadHdPrice)
        }

        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          successCount++
        }
      }

      toast({
        title: "Success",
        description: `${successCount} file(s) uploaded successfully with SD versions generated.`,
      })
      setIsUploadDialogOpen(false)
      setSelectedFiles(null)
      setUploadCategory("")
      setUploadHdPrice("")
      fetchUploads()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
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
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUpload) return

    try {
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
          portfolioCategory: editFormData.portfolioCategory || null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Upload updated successfully.",
        })
        setIsEditDialogOpen(false)
        setEditingUpload(null)
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

  const handleDownloadUpload = async (upload: UploadType) => {
    try {
      const response = await fetch(upload.publicUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = upload.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUpload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/uploads/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "File deleted successfully.",
        })
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

  const sortedUploads = [...uploads].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "name-asc":
        return a.originalName.localeCompare(b.originalName)
      case "name-desc":
        return b.originalName.localeCompare(a.originalName)
      case "size-desc":
        return b.fileSize - a.fileSize
      case "size-asc":
        return a.fileSize - b.fileSize
      default:
        return 0
    }
  })

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
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Portfolio Categories</DialogTitle>
                    <DialogDescription>Create and manage portfolio categories for organizing media.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Weddings, Portraits, Events"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description (Optional)</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        placeholder="Brief description of this category"
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleCreateCategory} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Existing Categories</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((cat) => (
                          <div key={cat._id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-xs text-muted-foreground">{cat.slug}</span>
                          </div>
                        ))}
                        {categories.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Upload HD images or videos. SD versions will be auto-generated for images.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Portfolio Category *</Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && (
                        <p className="text-sm text-muted-foreground">No categories available. Create one first.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hdPrice">HD Download Price (₦ Naira)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                        <Input
                          id="hdPrice"
                          type="number"
                          min="0"
                          step="100"
                          value={uploadHdPrice}
                          onChange={(e) => setUploadHdPrice(e.target.value)}
                          placeholder="0 (Free if empty)"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set a price in Naira (₦) for HD downloads. SD downloads are always free. Leave empty for free HD
                        downloads.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="files">Select Files</Label>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                      />
                      {selectedFiles && selectedFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground">{selectedFiles.length} file(s) selected</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadFiles} disabled={uploading || !uploadCategory}>
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
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                {sortedUploads.length} file{sortedUploads.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading uploads...</p>
                </div>
              ) : sortedUploads.length === 0 ? (
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
                  {sortedUploads.map((upload) => (
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

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Upload</DialogTitle>
                <DialogDescription>Update upload details and category assignment.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="Optional title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTags">Tags (comma-separated)</Label>
                  <Input
                    id="editTags"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Portfolio Category</Label>
                  <Select
                    value={editFormData.portfolioCategory}
                    onValueChange={(value) => setEditFormData({ ...editFormData, portfolioCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={selectedUpload !== null} onOpenChange={() => setSelectedUpload(null)}>
            <DialogContent className="max-w-5xl w-full h-[80vh] p-0">
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

                  <div className="w-full h-full flex items-center justify-center p-4">
                    {selectedUpload.fileType.startsWith("video/") ? (
                      <video src={selectedUpload.publicUrl} controls className="max-w-full max-h-full" />
                    ) : (
                      <img
                        src={selectedUpload.publicUrl || "/placeholder.svg"}
                        alt={selectedUpload.originalName}
                        className="max-w-full max-h-full object-contain"
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
        </main>
      </div>
    </div>
  )
}
