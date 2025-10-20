"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Shield, Search, Plus, Edit, Trash2, FileText, Eye, EyeOff, FolderPlus, ImageIcon, Video } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: {
    name: string
    email?: string
  }
  category: {
    _id: string
    name: string
    slug: string
  }
  featuredImage?: string
  images?: string[]
  videos?: string[]
  tags: string[]
  readTime?: string
  isPublished: boolean
  publishedAt?: string
  viewCount: number
  createdAt: string
}

export default function AdminBlogPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")

  const [postFormData, setPostFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    authorName: "",
    authorEmail: "",
    category: "",
    featuredImage: "",
    images: "",
    videos: "",
    tags: "",
    readTime: "",
    isPublished: false,
  })

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [searchTerm, categoryFilter])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/blog-categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)

      const response = await fetch(`/api/admin/blog?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "Error",
        description: "Failed to load blog posts.",
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
      const response = await fetch("/api/admin/blog-categories", {
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

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!postFormData.title || !postFormData.excerpt || !postFormData.content || !postFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingPost ? `/api/admin/blog/${editingPost._id}` : "/api/admin/blog"
      const method = editingPost ? "PATCH" : "POST"

      const payload = {
        title: postFormData.title,
        excerpt: postFormData.excerpt,
        content: postFormData.content,
        author: {
          name: postFormData.authorName || session?.user?.name || "Admin",
          email: postFormData.authorEmail || session?.user?.email,
        },
        category: postFormData.category,
        featuredImage: postFormData.featuredImage || undefined,
        images: postFormData.images
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        videos: postFormData.videos
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        tags: postFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        readTime: postFormData.readTime || undefined,
        isPublished: postFormData.isPublished,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingPost ? "Blog post updated successfully." : "Blog post created successfully.",
        })
        setIsPostDialogOpen(false)
        setEditingPost(null)
        resetPostForm()
        fetchPosts()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save blog post.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog post.",
        variant: "destructive",
      })
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setPostFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      authorName: post.author.name,
      authorEmail: post.author.email || "",
      category: post.category._id,
      featuredImage: post.featuredImage || "",
      images: post.images?.join("\n") || "",
      videos: post.videos?.join("\n") || "",
      tags: post.tags.join(", "),
      readTime: post.readTime || "",
      isPublished: post.isPublished,
    })
    setIsPostDialogOpen(true)
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog post deleted successfully.",
        })
        fetchPosts()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete blog post.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive",
      })
    }
  }

  const resetPostForm = () => {
    setPostFormData({
      title: "",
      excerpt: "",
      content: "",
      authorName: "",
      authorEmail: "",
      category: "",
      featuredImage: "",
      images: "",
      videos: "",
      tags: "",
      readTime: "",
      isPublished: false,
    })
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
              <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
              <p className="text-muted-foreground">Create and manage blog posts displayed on the blog page</p>
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
                    <DialogTitle>Blog Categories</DialogTitle>
                    <DialogDescription>Create and manage blog categories for organizing posts.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Photography Tips, Behind the Scenes"
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
                            <Badge variant={cat.isActive ? "default" : "secondary"}>{cat.slug}</Badge>
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

              <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingPost(null)
                      resetPostForm()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                    <DialogDescription>
                      {editingPost ? "Update blog post details" : "Create a new blog post for the blog page"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitPost} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={postFormData.title}
                          onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="excerpt">Excerpt *</Label>
                        <Textarea
                          id="excerpt"
                          value={postFormData.excerpt}
                          onChange={(e) => setPostFormData({ ...postFormData, excerpt: e.target.value })}
                          rows={2}
                          placeholder="Brief summary of the blog post"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                          id="content"
                          value={postFormData.content}
                          onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                          rows={8}
                          placeholder="Full blog post content"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="authorName">Author Name</Label>
                        <Input
                          id="authorName"
                          value={postFormData.authorName}
                          onChange={(e) => setPostFormData({ ...postFormData, authorName: e.target.value })}
                          placeholder={session?.user?.name || "Admin"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="authorEmail">Author Email</Label>
                        <Input
                          id="authorEmail"
                          type="email"
                          value={postFormData.authorEmail}
                          onChange={(e) => setPostFormData({ ...postFormData, authorEmail: e.target.value })}
                          placeholder={session?.user?.email || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={postFormData.category}
                          onValueChange={(value) => setPostFormData({ ...postFormData, category: value })}
                        >
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
                          <p className="text-sm text-muted-foreground mt-1">
                            No categories available. Create one first.
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="readTime">Read Time</Label>
                        <Input
                          id="readTime"
                          value={postFormData.readTime}
                          onChange={(e) => setPostFormData({ ...postFormData, readTime: e.target.value })}
                          placeholder="e.g., 5 min read"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="featuredImage">Featured Image URL</Label>
                        <Input
                          id="featuredImage"
                          value={postFormData.featuredImage}
                          onChange={(e) => setPostFormData({ ...postFormData, featuredImage: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="images">Additional Images (one per line)</Label>
                        <Textarea
                          id="images"
                          value={postFormData.images}
                          onChange={(e) => setPostFormData({ ...postFormData, images: e.target.value })}
                          rows={3}
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="videos">Video URLs (one per line)</Label>
                        <Textarea
                          id="videos"
                          value={postFormData.videos}
                          onChange={(e) => setPostFormData({ ...postFormData, videos: e.target.value })}
                          rows={3}
                          placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={postFormData.tags}
                          onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value })}
                          placeholder="photography, tips, tutorial"
                        />
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Switch
                          id="isPublished"
                          checked={postFormData.isPublished}
                          onCheckedChange={(checked) => setPostFormData({ ...postFormData, isPublished: checked })}
                        />
                        <Label htmlFor="isPublished">Published (visible on blog page)</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsPostDialogOpen(false)
                          setEditingPost(null)
                          resetPostForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">{editingPost ? "Update Post" : "Create Post"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold text-foreground">{posts.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold text-foreground">{posts.filter((p) => p.isPublished).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold text-foreground">{posts.filter((p) => !p.isPublished).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <FolderPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Posts Table */}
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading blog posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
                  <p className="text-muted-foreground mb-4">Create your first blog post to get started.</p>
                  <Button
                    onClick={() => {
                      setEditingPost(null)
                      resetPostForm()
                      setIsPostDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blog Post
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium line-clamp-1">{post.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</div>
                            {post.featuredImage && (
                              <Badge variant="outline" className="mt-1">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                              </Badge>
                            )}
                            {post.videos && post.videos.length > 0 && (
                              <Badge variant="outline" className="mt-1 ml-1">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{post.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{post.author.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.isPublished ? "default" : "secondary"}>
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{post.viewCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
