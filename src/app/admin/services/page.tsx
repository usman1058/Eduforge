"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Trash2, Clock, CheckCircle2, DollarSign, Settings, MoreVertical, Package, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Service {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  idealUseCase?: string
  estimatedTurnaround?: string
  price: number
  pricingNote: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  _count?: {
    requests: number
  }
}

interface ServiceWithCount extends Service {
  _count: {
    requests: number
  }
}

export default function AdminServicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [services, setServices] = useState<ServiceWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithCount | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    idealUseCase: "",
    estimatedTurnaround: "",
    price: 0,
    pricingNote: "",
    sortOrder: 0,
    isActive: true,
  })

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchServices()
  }, [session, router])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?active=false")

      if (!response.ok) throw new Error("Failed to fetch services")

      const data = await response.json()
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to fetch services. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create service")

      toast({
        title: "Service Created",
        description: `"${formData.name}" has been added successfully.`,
      })

      setCreateDialogOpen(false)
      resetForm()
      fetchServices()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    setSaving(true)

    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update service")

      toast({
        title: "Service Updated",
        description: `"${formData.name}" has been updated successfully.`,
      })

      setEditingService(null)
      resetForm()
      fetchServices()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This cannot be undone.")) return

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete service")

      toast({
        title: "Service Deleted",
        description: "Service has been deleted successfully.",
      })

      fetchServices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (service: ServiceWithCount) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description,
      longDescription: service.longDescription || "",
      idealUseCase: service.idealUseCase || "",
      estimatedTurnaround: service.estimatedTurnaround || "",
      price: service.price,
      pricingNote: service.pricingNote,
      sortOrder: service.sortOrder,
      isActive: service.isActive,
    })
    setCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      idealUseCase: "",
      estimatedTurnaround: "",
      price: 0,
      pricingNote: "",
      sortOrder: 0,
      isActive: true,
    })
    setEditingService(null)
    setShowPassword(false)
  }

  const handleToggleActive = async (service: ServiceWithCount) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...service,
          isActive: !service.isActive,
        }),
      })

      if (!response.ok) throw new Error("Failed to update service")

      toast({
        title: "Service Status Updated",
        description: `Service is now ${service.isActive ? "inactive" : "active"}`,
      })

      fetchServices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service status.",
        variant: "destructive",
      })
    }
  }

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalServices = services.length
  const activeServices = services.filter((s) => s.isActive).length
  const totalRequests = services.reduce((sum, s) => sum + (s._count?.requests || 0), 0)
  const totalRevenue = services.reduce((sum, s) => sum + (s.price * (s._count?.requests || 0)), 0)

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6">
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
              <p className="text-muted-foreground">
                Manage academic services and pricing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {editingService ? "Edit Service" : "Create New Service"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingService
                      ? "Update service details and pricing"
                      : "Create a new academic service with its pricing"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Service Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Essay Writing"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug" className="text-sm font-medium">
                          URL Slug <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="slug"
                          required
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                          }
                          placeholder="e.g., essay-writing"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium">
                          Base Price (USD) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">$</span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                            }
                            className="pl-10 h-11"
                            placeholder="e.g., 50.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sortOrder" className="text-sm font-medium">
                          Display Order
                        </Label>
                        <Input
                          id="sortOrder"
                          type="number"
                          min="0"
                          value={formData.sortOrder}
                          onChange={(e) =>
                            setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                          }
                          className="h-11"
                          placeholder="Lower numbers appear first"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Short Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Brief description shown in service cards"
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="longDescription" className="text-sm font-medium">
                          Full Description
                        </Label>
                        <Textarea
                          id="longDescription"
                          value={formData.longDescription}
                          onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                          placeholder="Detailed description shown on service detail page"
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idealUseCase" className="text-sm font-medium">
                          Ideal Use Case
                        </Label>
                        <Input
                          id="idealUseCase"
                          value={formData.idealUseCase}
                          onChange={(e) => setFormData({ ...formData, idealUseCase: e.target.value })}
                          placeholder="e.g., Research papers, argumentative essays"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedTurnaround" className="text-sm font-medium">
                          Turnaround Time
                        </Label>
                        <Input
                          id="estimatedTurnaround"
                          value={formData.estimatedTurnaround}
                          onChange={(e) => setFormData({ ...formData, estimatedTurnaround: e.target.value })}
                          placeholder="e.g., 3-7 days"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Width Section */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricingNote" className="text-sm font-medium">
                        Pricing Note <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="pricingNote"
                        required
                        value={formData.pricingNote}
                        onChange={(e) => setFormData({ ...formData, pricingNote: e.target.value })}
                        placeholder="e.g., Fixed pricing based on word count"
                        rows={2}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This note will be displayed to users alongside the price
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Active Status</span>
                          <div className="h-px w-px bg-muted-foreground/20 mx-2"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formData.isActive ? "Service will be visible to students" : "Service will be hidden from students"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="isActive" className="sr-only">Active Status</Label>
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreateDialogOpen(false)
                        setEditingService(null)
                        resetForm()
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 rounded-full border-t-transparent animate-spin" />
                          <span className="ml-2">{editingService ? "Updating..." : "Creating..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {editingService ? "Update Service" : "Create Service"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-50">Total Services</p>
                  <p className="text-3xl font-bold">{totalServices}</p>
                </div>
                <Package className="h-8 w-8 text-blue-50/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-50">Active Services</p>
                  <p className="text-3xl font-bold">{activeServices}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-50/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-50">Total Requests</p>
                  <p className="text-3xl font-bold">{totalRequests}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-50/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-50">Revenue (Est.)</p>
                  <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-50/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services by name, description, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              All Services
            </CardTitle>
            <CardDescription>
              {filteredServices.length === 0
                ? "No services found"
                : `Showing ${filteredServices.length} of ${totalServices} service${totalServices !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No services match your search criteria." : "Get started by creating your first service."}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Service
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/80">
                      <TableHead className="w-[20%]">Name</TableHead>
                      <TableHead className="w-[15%]">Price</TableHead>
                      <TableHead className="w-[20%]">Turnaround</TableHead>
                      <TableHead className="w-[15%]">Requests</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="w-[10%]">Order</TableHead>
                      <TableHead className="w-[10%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service, index) => (
                      <TableRow
                        key={service.id}
                        className="hover:bg-muted/50 transition-colors border-b"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{service.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {service.slug}
                                </Badge>
                                <span className="text-xs text-muted-foreground">Created {new Date(service.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              ${service.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">USD</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                              {service.estimatedTurnaround || "-"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge variant="outline" className="font-medium">
                            {service._count?.requests ?? 0}
                          </Badge>
                          <span className="text-sm text-muted-foreground">requests</span>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                            className="font-medium"
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge variant="outline" className="font-mono">
                            {service.sortOrder}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(service)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(service)}
                              className={`h-8 w-8 ${service.isActive ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"}`}
                            >
                              {service.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Information */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Service Management Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Setting Up Services
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create clear, descriptive service names that students will easily understand
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  Pricing Strategy
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use pricing notes to communicate your pricing structure (e.g., "Fixed at $50", "$15 per page", "Custom quote")
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Managing Services
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use the order field to control which services appear first. Lower numbers = higher priority.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-500" />
                  Best Practices
                </h4>
                <p className="text-sm text-muted-foreground">
                  Always test inactive services before deletion. Use descriptions to help users choose the right service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
