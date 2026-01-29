"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Plus, Trash2, Save, Edit, PackageIcon, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ServicePackage {
  name: string
  description: string
  price: number
  features: string[]
  isPopular?: boolean
}

interface AddOn {
  name: string
  description: string
  price: number
}

interface ServicePricing {
  _id?: string
  serviceName: string
  serviceType: string
  description: string
  basePrice: number
  currency: string
  packages: ServicePackage[]
  addOns: AddOn[]
  isActive: boolean
  displayOrder: number
}

const serviceTypes = [
  { value: "portrait", label: "Portrait Session" },
  { value: "wedding", label: "Wedding Photography" },
  { value: "event", label: "Event Photography" },
  { value: "family", label: "Family Photos" },
  { value: "corporate", label: "Corporate Headshots" },
  { value: "product", label: "Product Photography" },
  { value: "other", label: "Other" },
]

export default function AdminPricingPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [services, setServices] = useState<ServicePricing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServicePricing | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const emptyService: ServicePricing = {
    serviceName: "",
    serviceType: "portrait",
    description: "",
    basePrice: 0,
    currency: "NGN",
    packages: [],
    addOns: [],
    isActive: true,
    displayOrder: 0,
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/pricing")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleSaveService = async () => {
    if (!editingService) return

    try {
      const method = editingService._id ? "PUT" : "POST"
      const url = editingService._id ? `/api/admin/pricing/${editingService._id}` : "/api/admin/pricing"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Service pricing ${editingService._id ? "updated" : "created"} successfully`,
        })
        fetchServices()
        setIsDialogOpen(false)
        setEditingService(null)
      } else {
        throw new Error("Failed to save service")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service pricing",
        variant: "destructive",
      })
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service pricing?")) return

    try {
      const response = await fetch(`/api/admin/pricing/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service pricing deleted successfully",
        })
        fetchServices()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service pricing",
        variant: "destructive",
      })
    }
  }

  const addPackage = () => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      packages: [...editingService.packages, { name: "", description: "", price: 0, features: [""], isPopular: false }],
    })
  }

  const removePackage = (index: number) => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      packages: editingService.packages.filter((_, i) => i !== index),
    })
  }

  const updatePackage = (index: number, field: keyof ServicePackage, value: any) => {
    if (!editingService) return
    const newPackages = [...editingService.packages]
    newPackages[index] = { ...newPackages[index], [field]: value }
    setEditingService({ ...editingService, packages: newPackages })
  }

  const addFeature = (packageIndex: number) => {
    if (!editingService) return
    const newPackages = [...editingService.packages]
    newPackages[packageIndex].features.push("")
    setEditingService({ ...editingService, packages: newPackages })
  }

  const updateFeature = (packageIndex: number, featureIndex: number, value: string) => {
    if (!editingService) return
    const newPackages = [...editingService.packages]
    newPackages[packageIndex].features[featureIndex] = value
    setEditingService({ ...editingService, packages: newPackages })
  }

  const removeFeature = (packageIndex: number, featureIndex: number) => {
    if (!editingService) return
    const newPackages = [...editingService.packages]
    newPackages[packageIndex].features = newPackages[packageIndex].features.filter((_, i) => i !== featureIndex)
    setEditingService({ ...editingService, packages: newPackages })
  }

  const addAddOn = () => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      addOns: [...editingService.addOns, { name: "", description: "", price: 0 }],
    })
  }

  const removeAddOn = (index: number) => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      addOns: editingService.addOns.filter((_, i) => i !== index),
    })
  }

  const updateAddOn = (index: number, field: keyof AddOn, value: any) => {
    if (!editingService) return
    const newAddOns = [...editingService.addOns]
    newAddOns[index] = { ...newAddOns[index], [field]: value }
    setEditingService({ ...editingService, addOns: newAddOns })
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Service Pricing Configuration</h1>
              <p className="text-muted-foreground">Manage pricing for all photography services</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingService(emptyService)
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService?._id ? "Edit" : "Add"} Service Pricing</DialogTitle>
                  <DialogDescription>Configure pricing, packages, and add-ons for this service</DialogDescription>
                </DialogHeader>

                {editingService && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Service Type</Label>
                          <Select
                            value={editingService.serviceType}
                            onValueChange={(value) => setEditingService({ ...editingService, serviceType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Service Name</Label>
                          <Input
                            value={editingService.serviceName}
                            onChange={(e) => setEditingService({ ...editingService, serviceName: e.target.value })}
                            placeholder="e.g., Professional Portrait Session"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={editingService.description}
                          onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                          rows={3}
                          placeholder="Describe this service..."
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Base Price</Label>
                          <Input
                            type="number"
                            value={editingService.basePrice}
                            onChange={(e) =>
                              setEditingService({ ...editingService, basePrice: Number.parseFloat(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select
                            value={editingService.currency}
                            onValueChange={(value) => setEditingService({ ...editingService, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NGN">NGN</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={editingService.displayOrder}
                            onChange={(e) =>
                              setEditingService({ ...editingService, displayOrder: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingService.isActive}
                          onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <Separator />

                    {/* Packages */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Packages</h3>
                        <Button size="sm" variant="outline" onClick={addPackage}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                      {editingService.packages.map((pkg, pkgIndex) => (
                        <Card key={pkgIndex}>
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Package {pkgIndex + 1}</Badge>
                              <Button size="sm" variant="ghost" onClick={() => removePackage(pkgIndex)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Package Name</Label>
                                <Input
                                  value={pkg.name}
                                  onChange={(e) => updatePackage(pkgIndex, "name", e.target.value)}
                                  placeholder="e.g., Basic, Standard, Premium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price</Label>
                                <Input
                                  type="number"
                                  value={pkg.price}
                                  onChange={(e) => updatePackage(pkgIndex, "price", Number.parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={pkg.description}
                                onChange={(e) => updatePackage(pkgIndex, "description", e.target.value)}
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Features</Label>
                                <Button size="sm" variant="outline" onClick={() => addFeature(pkgIndex)}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Feature
                                </Button>
                              </div>
                              {pkg.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex gap-2">
                                  <Input
                                    value={feature}
                                    onChange={(e) => updateFeature(pkgIndex, featureIndex, e.target.value)}
                                    placeholder="Feature description"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFeature(pkgIndex, featureIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={pkg.isPopular}
                                onCheckedChange={(checked) => updatePackage(pkgIndex, "isPopular", checked)}
                              />
                              <Label>Mark as Popular</Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Separator />

                    {/* Add-ons */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Add-ons</h3>
                        <Button size="sm" variant="outline" onClick={addAddOn}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Add-on
                        </Button>
                      </div>
                      {editingService.addOns.map((addOn, addOnIndex) => (
                        <Card key={addOnIndex}>
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Add-on {addOnIndex + 1}</Badge>
                              <Button size="sm" variant="ghost" onClick={() => removeAddOn(addOnIndex)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Add-on Name</Label>
                                <Input
                                  value={addOn.name}
                                  onChange={(e) => updateAddOn(addOnIndex, "name", e.target.value)}
                                  placeholder="e.g., Extra Hour, Prints"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price</Label>
                                <Input
                                  type="number"
                                  value={addOn.price}
                                  onChange={(e) => updateAddOn(addOnIndex, "price", Number.parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={addOn.description}
                                onChange={(e) => updateAddOn(addOnIndex, "description", e.target.value)}
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveService}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Service
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List */}
          <div className="grid gap-6">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">Loading services...</CardContent>
              </Card>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Services Configured</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first service pricing</p>
                  <Button
                    onClick={() => {
                      setEditingService(emptyService)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              services.map((service) => (
                <Card key={service._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{service.serviceName}</CardTitle>
                          {!service.isActive && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingService(service)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteService(service._id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Base Price</p>
                        <p className="text-2xl font-bold">
                          {service.currency} {service.basePrice.toLocaleString()}
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div>
                        <p className="text-sm text-muted-foreground">Packages</p>
                        <p className="text-2xl font-bold">{service.packages.length}</p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div>
                        <p className="text-sm text-muted-foreground">Add-ons</p>
                        <p className="text-2xl font-bold">{service.addOns.length}</p>
                      </div>
                    </div>

                    {service.packages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Packages</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {service.packages.map((pkg, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{pkg.name}</p>
                                {pkg.isPopular && <Badge variant="default">Popular</Badge>}
                              </div>
                              <p className="text-lg font-bold text-primary">
                                {service.currency} {pkg.price.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{pkg.features.length} features</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
