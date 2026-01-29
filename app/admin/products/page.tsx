"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Plus, Search, Edit, Trash2, Package, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"

interface Product {
  _id: string
  title: string
  description: string
  type: "digital" | "physical" | "service"
  category: string
  price: number
  currency: string
  images: string[]
  features?: string[]
  icon?: string
  licenseType: string
  isActive: boolean
  stock?: number
  salesCount: number
  revenue: number
  createdAt: string
}

export default function AdminProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "service" as "digital" | "physical" | "service",
    category: "",
    price: 0,
    currency: "NGN",
    licenseType: "standard",
    licenseDetails: "",
    tags: "",
    features: "",
    icon: "",
    isActive: true,
    stock: 0,
    downloadLimit: 5,
    specifications: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm, typeFilter, categoryFilter])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        type: typeFilter,
        category: categoryFilter,
      })

      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : "/api/admin/products"
      const method = editingProduct ? "PATCH" : "POST"

      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingProduct ? "Product updated successfully" : "Product created successfully")
        setIsCreateDialogOpen(false)
        setEditingProduct(null)
        resetForm()
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Product deleted successfully")
        fetchProducts()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "service",
      category: "",
      price: 0,
      currency: "NGN",
      licenseType: "standard",
      licenseDetails: "",
      tags: "",
      features: "",
      icon: "",
      isActive: true,
      stock: 0,
      downloadLimit: 5,
      specifications: "",
    })
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description,
      type: product.type,
      category: product.category,
      price: product.price,
      currency: product.currency,
      licenseType: product.licenseType,
      licenseDetails: "",
      tags: "",
      features: product.features?.join("\n") || "",
      icon: product.icon || "",
      isActive: product.isActive,
      stock: product.stock || 0,
      downloadLimit: 5,
      specifications: "",
    })
    setIsCreateDialogOpen(true)
  }

  const formatAmount = (amount: number, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const handleSignOut = async () => {
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
              <div className="h-10 bg-muted rounded" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.isActive).length
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)
  const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0)

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
              <p className="text-muted-foreground">Create and manage services displayed on the services page</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Service" : "Create New Service"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? "Update service details" : "Create a new service for the services page"}
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
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Photography, Videography"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon">Icon Name</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="e.g., Camera, Video"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="features">Features (one per line) *</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      rows={5}
                      placeholder="Full-day coverage&#10;Engagement shoot&#10;Second photographer&#10;Online gallery&#10;Print rights"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseDetails">License Details *</Label>
                    <Textarea
                      id="licenseDetails"
                      value={formData.licenseDetails}
                      onChange={(e) => setFormData({ ...formData, licenseDetails: e.target.value })}
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="photography, wedding, professional"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active (visible on services page)</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingProduct ? "Update Service" : "Create Service"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={totalProducts}
              icon={Package}
              gradientClass="stat-card-gradient-1"
            />
            <StatCard
              title="Active Products"
              value={activeProducts}
              icon={Package}
              gradientClass="stat-card-gradient-2"
            />
            <StatCard
              title="Total Revenue"
              value={formatAmount(totalRevenue)}
              icon={TrendingUp}
              gradientClass="stat-card-gradient-3"
            />
            <StatCard title="Total Sales" value={totalSales} icon={TrendingUp} gradientClass="stat-card-gradient-4" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="videography">Videography</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="templates">Templates</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
                    ? "No products match your search criteria."
                    : "Create your first service to get started."}
                </p>
                {!searchTerm && typeFilter === "all" && categoryFilter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                          <Badge variant="outline" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatAmount(product.price, product.currency)}</div>
                        <div className="text-xs text-muted-foreground">{product.licenseType} license</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {product.salesCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatAmount(product.revenue, product.currency)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(product.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

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
