"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shield, ArrowLeft, Upload, Settings, Eye, Lock, Download, ImageIcon, Users, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MasonryGallery } from "@/components/gallery/masonry-gallery"
import Link from "next/link"

export default function GalleryDetailPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const galleryId = params.id as string

  const [gallery, setGallery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    isPublic: true,
    downloadEnabled: true,
  })

  useEffect(() => {
    fetchGallery()
  }, [galleryId])

  useEffect(() => {
    if (gallery) {
      setSettings({
        title: gallery.title,
        description: gallery.description || "",
        isPublic: gallery.isPublic,
        downloadEnabled: gallery.downloadEnabled,
      })
    }
  }, [gallery])

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery)
      } else {
        toast({
          title: "Error",
          description: "Failed to load gallery.",
          variant: "destructive",
        })
        router.push("/admin/galleries")
      }
    } catch (error) {
      console.error("Error fetching gallery:", error)
      toast({
        title: "Error",
        description: "Failed to load gallery.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

    setUploading(true)

    try {
      const formData = new FormData()
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i])
      }

      const response = await fetch(`/api/admin/galleries/${galleryId}/uploads`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `${data.count} file(s) uploaded successfully.`,
        })
        setIsUploadDialogOpen(false)
        setSelectedFiles(null)
        fetchGallery()
      } else {
        throw new Error("Upload failed")
      }
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

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Gallery settings updated successfully.",
        })
        setIsSettingsDialogOpen(false)
        fetchGallery()
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings.",
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

  if (loading) {
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
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-64 bg-muted rounded" />
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/galleries">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{gallery?.title}</h1>
                <p className="text-muted-foreground">{gallery?.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{gallery?.uploads?.length || 0}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="text-2xl font-bold">{gallery?.viewCount || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visibility</p>
                    <Badge variant={gallery?.isPublic ? "default" : "secondary"} className="mt-1">
                      {gallery?.isPublic ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                    <Badge variant={gallery?.downloadEnabled ? "default" : "secondary"} className="mt-1">
                      {gallery?.downloadEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <Download className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Content */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery Content</CardTitle>
              <CardDescription>Photos and videos in this gallery</CardDescription>
            </CardHeader>
            <CardContent>
              {gallery?.uploads && gallery.uploads.length > 0 ? (
                <MasonryGallery items={gallery.uploads} allowDownload={gallery.downloadEnabled} />
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground mb-4">Upload photos and videos to get started.</p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files to Gallery</DialogTitle>
                <DialogDescription>Upload photos and videos to this gallery.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                <Button onClick={handleUploadFiles} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings Dialog */}
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gallery Settings</DialogTitle>
                <DialogDescription>Update gallery settings and permissions.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Gallery Title</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublic">Public Gallery</Label>
                  <Switch
                    id="isPublic"
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => setSettings({ ...settings, isPublic: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="downloadEnabled">Allow Downloads</Label>
                  <Switch
                    id="downloadEnabled"
                    checked={settings.downloadEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, downloadEnabled: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
