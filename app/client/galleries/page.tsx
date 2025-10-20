"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Plus, Search, Eye, Lock, Download, Edit, Trash2, ImageIcon, Calendar, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useToast } from "@/hooks/use-toast"
import { CameraLoading } from "@/components/camera-loading"

interface Gallery {
  _id: string
  title: string
  description?: string
  isPublic: boolean
  uploads: any[]
  coverImage?: string
  watermarkEnabled: boolean
  watermarkText: string
  watermarkOpacity: number
  downloadEnabled: boolean
  isPaid: boolean
  price?: number
  paidUsers: string[]
  viewCount: number
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function MyGalleriesPage() {
  const { data: session } = useSession()
  const { toast: toastHook } = useToast()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    password: "",
    isPublic: false,
    watermarkEnabled: true,
    watermarkText: "© SetMedia",
    watermarkOpacity: 0.5,
    downloadEnabled: false,
    isPaid: false,
    price: null,
    tags: "",
    expiresAt: "",
  })

  const handleSignOut = async () => {
    toastHook({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    await signOut({ callbackUrl: "/" })
  }

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      const response = await fetch("/api/client/galleries")
      if (response.ok) {
        const data = await response.json()
        setGalleries(data.galleries)
      }
    } catch (error) {
      console.error("Error fetching galleries:", error)
      toast.error("Failed to load galleries")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingGallery ? `/api/client/galleries/${editingGallery._id}` : "/api/client/galleries"
      const method = editingGallery ? "PATCH" : "POST"

      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        expiresAt: formData.expiresAt || null,
        price: formData.price || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingGallery ? "Gallery updated successfully" : "Gallery created successfully")
        setIsCreateDialogOpen(false)
        setEditingGallery(null)
        resetForm()
        fetchGalleries()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving gallery:", error)
      toast.error("Failed to save gallery")
    }
  }

  const handleDelete = async (galleryId: string) => {
    if (!confirm("Are you sure you want to delete this gallery?")) return

    try {
      const response = await fetch(`/api/client/galleries/${galleryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Gallery deleted successfully")
        fetchGalleries()
      } else {
        toast.error("Failed to delete gallery")
      }
    } catch (error) {
      console.error("Error deleting gallery:", error)
      toast.error("Failed to delete gallery")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      password: "",
      isPublic: false,
      watermarkEnabled: true,
      watermarkText: "© SetMedia",
      watermarkOpacity: 0.5,
      downloadEnabled: false,
      isPaid: false,
      price: null,
      tags: "",
      expiresAt: "",
    })
  }

  const openEditDialog = (gallery: Gallery) => {
    setEditingGallery(gallery)
    setFormData({
      title: gallery.title,
      description: gallery.description || "",
      password: "",
      isPublic: gallery.isPublic,
      watermarkEnabled: gallery.watermarkEnabled,
      watermarkText: gallery.watermarkText,
      watermarkOpacity: gallery.watermarkOpacity,
      downloadEnabled: gallery.downloadEnabled,
      isPaid: gallery.isPaid,
      price: gallery.price || null,
      tags: gallery.tags.join(", "),
      expiresAt: "",
    })
    setIsCreateDialogOpen(true)
  }

  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (!session) {
    return <CameraLoading />
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role || "client",
          }}
          onSignOut={handleSignOut}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            user={{
              name: session.user?.name,
              email: session.user?.email,
              image: session.user?.image,
              role: session.user?.role || "client",
            }}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </main>
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
          role: session.user?.role || "client",
        }}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role || "client",
          }}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Galleries</h1>
              <p className="text-muted-foreground">View galleries you own, have been assigned to, or have purchased</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gallery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingGallery ? "Edit Gallery" : "Create New Gallery"}</DialogTitle>
                  <DialogDescription>
                    {editingGallery ? "Update your gallery settings" : "Create a new gallery to organize your uploads"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="wedding, portrait, landscape"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password Protection</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty for no password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                    <Label htmlFor="isPublic">Make gallery public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="watermarkEnabled"
                      checked={formData.watermarkEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, watermarkEnabled: checked })}
                    />
                    <Label htmlFor="watermarkEnabled">Enable watermark</Label>
                  </div>
                  {formData.watermarkEnabled && (
                    <>
                      <div>
                        <Label htmlFor="watermarkText">Watermark Text</Label>
                        <Input
                          id="watermarkText"
                          value={formData.watermarkText}
                          onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="watermarkOpacity">
                          Watermark Opacity: {Math.round(formData.watermarkOpacity * 100)}%
                        </Label>
                        <Slider
                          id="watermarkOpacity"
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={[formData.watermarkOpacity]}
                          onValueChange={(value) => setFormData({ ...formData, watermarkOpacity: value[0] })}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="downloadEnabled"
                      checked={formData.downloadEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, downloadEnabled: checked })}
                    />
                    <Label htmlFor="downloadEnabled">Allow downloads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPaid"
                      checked={formData.isPaid}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                    />
                    <Label htmlFor="isPaid">Enable paid content</Label>
                  </div>
                  {formData.isPaid && (
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || null })}
                        placeholder="Enter price"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingGallery ? "Update Gallery" : "Create Gallery"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search galleries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredGalleries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No galleries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No galleries match your search."
                    : "You don't have access to any galleries yet. Purchase or get assigned to galleries to see them here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleries.map((gallery) => (
                <Card key={gallery._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    {gallery.coverImage ? (
                      <img
                        src={gallery.coverImage || "/placeholder.svg"}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{gallery.title}</CardTitle>
                        {gallery.description && (
                          <CardDescription className="mt-1 line-clamp-2">{gallery.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(gallery)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(gallery._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {gallery.isPublic ? (
                        <Badge variant="secondary">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {gallery.isPaid && (
                        <Badge variant="default" className="bg-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      )}
                      {gallery.downloadEnabled && (
                        <Badge variant="secondary">
                          <Download className="h-3 w-3 mr-1" />
                          Downloads
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {gallery.uploads.length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {gallery.viewCount} views
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(gallery.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {gallery.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {gallery.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {gallery.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{gallery.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
