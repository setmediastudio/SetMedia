"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Trash2, ChevronRight, AlertCircle, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SubCategoryInput {
  id: string
  name: string
  description: string
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

interface AddSubCategoryFormData {
  name: string
  description: string
}

interface CategoryBuilderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CategoryBuilderModal({ open, onOpenChange, onSuccess }: CategoryBuilderModalProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"create" | "browse">("create")
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [subCategories, setSubCategories] = useState<SubCategoryInput[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [nextSubCatId, setNextSubCatId] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryData, setEditingCategoryData] = useState<{
    name: string
    description: string
  }>({ name: "", description: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [parentCategoryForSubCat, setParentCategoryForSubCat] = useState<string | null>(null)
  const [subCategoryFormData, setSubCategoryFormData] = useState<AddSubCategoryFormData>({
    name: "",
    description: "",
  })
  const [isSubmittingSubCategory, setIsSubmittingSubCategory] = useState(false)

  useEffect(() => {
    if (open && mode === "browse") {
      fetchCategories()
    }
  }, [open, mode])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/portfolio-categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCategoryName("")
    setCategoryDescription("")
    setSubCategories([])
    setNextSubCatId(1)
  }

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, { id: `temp-${nextSubCatId}`, name: "", description: "" }])
    setNextSubCatId(nextSubCatId + 1)
  }

  const handleRemoveSubCategory = (id: string) => {
    setSubCategories(subCategories.filter((sc) => sc.id !== id))
  }

  const handleSubCategoryChange = (id: string, field: keyof SubCategoryInput, value: string) => {
    setSubCategories(subCategories.map((sc) => (sc.id === id ? { ...sc, [field]: value } : sc)))
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Main category name is required.",
        variant: "destructive",
      })
      return
    }

    const validSubCats = subCategories.filter((sc) => sc.name.trim())
    if (validSubCats.length > 0) {
      const allNamed = subCategories.every((sc) => sc.name.trim())
      if (!allNamed) {
        toast({
          title: "Error",
          description: "All added sub-categories must have a name.",
          variant: "destructive",
        })
        return
      }
    }

    setIsCreating(true)
    try {
      const mainCatResponse = await fetch("/api/admin/portfolio-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          order: 0,
        }),
      })

      if (!mainCatResponse.ok) {
        const error = await mainCatResponse.json()
        throw new Error(error.error || "Failed to create main category")
      }

      const mainCatData = await mainCatResponse.json()
      const parentCategoryId = mainCatData.category._id

      if (validSubCats.length > 0) {
        for (let i = 0; i < validSubCats.length; i++) {
          const subCat = validSubCats[i]
          const subCatResponse = await fetch("/api/admin/portfolio-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: subCat.name,
              description: subCat.description,
              order: i,
              parentCategoryId: parentCategoryId,
            }),
          })

          if (!subCatResponse.ok) {
            throw new Error(`Failed to create sub-category: ${subCat.name}`)
          }
        }
      }

      toast({
        title: "Success",
        description: `Category "${categoryName}" created with ${validSubCats.length} sub-categor${validSubCats.length === 1 ? "y" : "ies"}.`,
      })

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategoryId) return
    if (!editingCategoryData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/portfolio-categories/${editingCategoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategoryData.name,
          description: editingCategoryData.description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      toast({
        title: "Success",
        description: "Category updated successfully.",
      })

      setEditingCategoryId(null)
      fetchCategories()
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? This will delete the category and all its sub-categories.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/portfolio-categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Deleted successfully",
          description: "Category deleted successfully.",
        })
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

  const handleOpenAddSubCategory = (parentId: string) => {
    setParentCategoryForSubCat(parentId)
    setSubCategoryFormData({ name: "", description: "" })
    setIsAddSubCategoryOpen(true)
  }

  const handleCreateSubCategory = async () => {
    if (!subCategoryFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Sub-category name is required.",
        variant: "destructive",
      })
      return
    }

    if (!parentCategoryForSubCat) {
      toast({
        title: "Error",
        description: "Parent category not found.",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingSubCategory(true)
    try {
      const response = await fetch("/api/admin/portfolio-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subCategoryFormData.name,
          description: subCategoryFormData.description,
          parentCategoryId: parentCategoryForSubCat,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sub-category created successfully.",
        })
        setIsAddSubCategoryOpen(false)
        setParentCategoryForSubCat(null)
        setSubCategoryFormData({ name: "", description: "" })
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create sub-category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sub-category.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingSubCategory(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategoryId || !editingCategoryData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/portfolio-categories/${editingCategoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategoryData.name,
          description: editingCategoryData.description,
        }),
      })

      if (response.ok) {
        toast({
          title: "Updated successfully",
          description: "Category updated successfully.",
        })
        setIsEditing(false)
        setEditingCategoryId(null)
        fetchCategories()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update category.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const rootCategories = categories.filter((cat) => !cat.parentCategoryId)
  const getSubCategories = (parentId: string) => categories.filter((cat) => cat.parentCategoryId === parentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Portfolio Categories</DialogTitle>
          <DialogDescription>Create new categories or manage existing ones</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              mode === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setMode("browse")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              mode === "browse"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Manage Categories
          </button>
        </div>

        {mode === "create" && (
          <div className="space-y-6 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Main Category</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainCategoryName">
                    Category Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mainCategoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Weddings, Portraits, Events"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainCategoryDescription">Description (Optional)</Label>
                  <Textarea
                    id="mainCategoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Brief description of this category"
                    rows={2}
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Sub-Categories (Optional)</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSubCategory} disabled={isCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Category
                </Button>
              </div>

              {subCategories.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p className="text-sm">
                      No sub-categories added yet. Click "Add Sub-Category" to create organized groups within this
                      category.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {subCategories.map((subCat, index) => (
                    <Card key={subCat.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                          <span>Sub-Category {index + 1}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`subcat-name-${subCat.id}`}>
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`subcat-name-${subCat.id}`}
                            value={subCat.name}
                            onChange={(e) => handleSubCategoryChange(subCat.id, "name", e.target.value)}
                            placeholder="e.g., Ceremonies, Receptions, Engagement Shoots"
                            disabled={isCreating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`subcat-description-${subCat.id}`}>Description (Optional)</Label>
                          <Textarea
                            id={`subcat-description-${subCat.id}`}
                            value={subCat.description}
                            onChange={(e) => handleSubCategoryChange(subCat.id, "description", e.target.value)}
                            placeholder="Brief description"
                            rows={2}
                            disabled={isCreating}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveSubCategory(subCat.id)}
                          disabled={isCreating}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove This Sub-Category
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {subCategories.filter((sc) => sc.name.trim()).length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">Images will only be assignable to sub-categories</p>
                  <p className="text-xs opacity-90 mt-1">
                    The main category acts as a container. All images must be uploaded to one of the sub-categories you
                    define.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "browse" && (
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
            ) : rootCategories.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p className="text-sm">No categories created yet. Use "Create New" tab to add your first category.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rootCategories.map((category) => {
                  const subCats = getSubCategories(category._id)
                  const isEditingThis = editingCategoryId === category._id

                  return (
                    <Card key={category._id}>
                      <CardContent className="pt-6">
                        {isEditingThis ? (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Category Name</Label>
                              <Input
                                value={editingCategoryData.name}
                                onChange={(e) =>
                                  setEditingCategoryData({ ...editingCategoryData, name: e.target.value })
                                }
                                disabled={isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={editingCategoryData.description}
                                onChange={(e) =>
                                  setEditingCategoryData({ ...editingCategoryData, description: e.target.value })
                                }
                                rows={2}
                                disabled={isEditing}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateCategory} disabled={isEditing}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCategoryId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{category.name}</h4>
                                {category.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCategoryId(category._id)
                                    setEditingCategoryData({
                                      name: category.name,
                                      description: category.description || "",
                                    })
                                  }}
                                >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenAddSubCategory(category._id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Sub
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteCategory(category._id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {subCats.length > 0 && (
                              <div className="mt-4 pt-4 border-t space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Sub-Categories:</p>
                                <div className="space-y-2">
                                  {subCats.map((subCat) => {
                                    const isEditingSubCat = editingCategoryId === subCat._id
                                    return (
                                      <div
                                        key={subCat._id}
                                        className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-muted-foreground/10"
                                      >
                                        {isEditingSubCat ? (
                                          <div className="flex-1 space-y-2">
                                            <Input
                                              value={editingCategoryData.name}
                                              onChange={(e) =>
                                                setEditingCategoryData({ ...editingCategoryData, name: e.target.value })
                                              }
                                              placeholder="Sub-category name"
                                              disabled={isEditing}
                                            />
                                            <Textarea
                                              value={editingCategoryData.description}
                                              onChange={(e) =>
                                                setEditingCategoryData({
                                                  ...editingCategoryData,
                                                  description: e.target.value,
                                                })
                                              }
                                              placeholder="Description (optional)"
                                              rows={2}
                                              disabled={isEditing}
                                              className="text-xs"
                                            />
                                            <div className="flex gap-2">
                                              <Button size="sm" onClick={handleUpdateCategory} disabled={isEditing}>
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingCategoryId(null)}
                                                disabled={isEditing}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">{subCat.name}</span>
                                              </div>
                                              {subCat.description && (
                                                <p className="text-xs text-muted-foreground mt-1 ml-5">
                                                  {subCat.description}
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setEditingCategoryId(subCat._id)
                                                  setEditingCategoryData({
                                                    name: subCat.name,
                                                    description: subCat.description || "",
                                                  })
                                                }}
                                              >
                                                <Edit2 className="h-3 w-3 mr-1" />
                                                Edit
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteCategory(subCat._id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {mode === "create" && (
            <Button onClick={handleCreateCategory} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Category"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Add Sub-Category Dialog */}
      <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sub-Category</DialogTitle>
            <DialogDescription>
              Add a new sub-category to organize your portfolio items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sub-cat-name">Sub-Category Name *</Label>
              <Input
                id="sub-cat-name"
                value={subCategoryFormData.name}
                onChange={(e) =>
                  setSubCategoryFormData({
                    ...subCategoryFormData,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Weddings, Product Photography"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-cat-description">Description</Label>
              <Textarea
                id="sub-cat-description"
                value={subCategoryFormData.description}
                onChange={(e) =>
                  setSubCategoryFormData({
                    ...subCategoryFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Add an optional description for this sub-category"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubCategory} disabled={isSubmittingSubCategory}>
              {isSubmittingSubCategory ? "Creating..." : "Create Sub-Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
