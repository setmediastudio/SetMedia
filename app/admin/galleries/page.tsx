"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Search, Plus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { GalleryCard } from "@/components/gallery/gallery-card"

interface Gallery {
  _id: string
  title: string
  description?: string
  isPublic: boolean
  uploads: any[]
  createdBy: {
    _id: string
    name: string
    email: string
  }
  watermarkEnabled: boolean
  watermarkText: string
  downloadEnabled: boolean
  viewCount: number
  tags: string[]
  status: string
  createdAt: string
}

export default function AdminGalleriesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGallery, setNewGallery] = useState({
    title: "",
    description: "",
    isPublic: true,
    downloadEnabled: true,
  })

  useEffect(() => {
    fetchGalleries()
  }, [currentPage, searchTerm, statusFilter])

  const fetchGalleries = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        search: searchTerm,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/galleries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGalleries(data.galleries)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching galleries:", error)
      toast({
        title: "Error",
        description: "Failed to load galleries.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGallery = async () => {
    if (!newGallery.title.trim()) {
      toast({
        title: "Error",
        description: "Gallery title is required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGallery),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Gallery created successfully.",
        })
        setIsCreateDialogOpen(false)
        setNewGallery({
          title: "",
          description: "",
          isPublic: true,
          downloadEnabled: true,
        })
        fetchGalleries()
      } else {
        throw new Error("Failed to create gallery")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create gallery.",
        variant: "destructive",
      })
    }
  }

  const handleArchiveGallery = async (id: string) => {
    try {
      const gallery = galleries.find((g) => g._id === id)
      const newStatus = gallery?.status === "archived" ? "active" : "archived"

      const response = await fetch(`/api/admin/galleries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Gallery ${newStatus === "archived" ? "archived" : "unarchived"} successfully.`,
        })
        fetchGalleries()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update gallery.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/galleries/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Gallery deleted successfully.",
        })
        fetchGalleries()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery.",
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded" />
                ))}
              </div>
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
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gallery Management</h1>
              <p className="text-muted-foreground">Create and manage client galleries</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gallery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Gallery</DialogTitle>
                  <DialogDescription>Create a new gallery for your clients.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gallery Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter gallery title"
                      value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter gallery description"
                      value={newGallery.description}
                      onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPublic">Public Gallery</Label>
                    <Switch
                      id="isPublic"
                      checked={newGallery.isPublic}
                      onCheckedChange={(checked) => setNewGallery({ ...newGallery, isPublic: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="downloadEnabled">Allow Downloads</Label>
                    <Switch
                      id="downloadEnabled"
                      checked={newGallery.downloadEnabled}
                      onCheckedChange={(checked) => setNewGallery({ ...newGallery, downloadEnabled: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGallery}>Create Gallery</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Galleries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search galleries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Galleries Grid */}
          {galleries.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No galleries found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "No galleries match your search criteria."
                      : "Create your first gallery to get started."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Gallery
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <GalleryCard
                  key={gallery._id}
                  gallery={gallery}
                  onArchive={handleArchiveGallery}
                  onDelete={handleDeleteGallery}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
