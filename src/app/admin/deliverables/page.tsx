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
import { Search, Download, FileText, Calendar, Upload, Trash2, Plus, Eye, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Deliverable {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  createdAt: string
  request: {
    id: string
    title: string
    status: string
    user: {
      name: string
      email: string
    }
  }
}

export default function AdminDeliverablesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchDeliverables()
  }, [session, router])

  const fetchDeliverables = async () => {
    try {
      const response = await fetch("/api/deliverables")

      if (!response.ok) throw new Error("Failed to fetch deliverables")

      const data = await response.json()
      setDeliverables(data.deliverables || [])
    } catch (error) {
      console.error("Error fetching deliverables:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File
    const requestId = formData.get("requestId") as string

    if (!file || !requestId) {
      toast({
        title: "Error",
        description: "Please select a file and request ID",
        variant: "destructive",
      })
      setUploading(false)
      return
    }

    try {
      // Upload file
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("requestId", requestId)

      const uploadResponse = await fetch("/api/files", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) throw new Error("Failed to upload file")

      const uploadedFile = await uploadResponse.json()

      // Create deliverable
      const deliverableResponse = await fetch("/api/deliverables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          fileId: uploadedFile.id,
        }),
      })

      if (!deliverableResponse.ok) throw new Error("Failed to create deliverable")

      toast({
        title: "Success",
        description: "Deliverable uploaded successfully",
      })

      setUploadDialogOpen(false)
      fetchDeliverables()
    } catch (error) {
      console.error("Error uploading deliverable:", error)
      toast({
        title: "Error",
        description: "Failed to upload deliverable",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return

    try {
      const response = await fetch(`/api/deliverables/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete deliverable")

      toast({
        title: "Deleted",
        description: "Deliverable deleted successfully",
      })

      fetchDeliverables()
    } catch (error) {
      console.error("Error deleting deliverable:", error)
      toast({
        title: "Error",
        description: "Failed to delete deliverable",
        variant: "destructive",
      })
    }
  }

  const filteredDeliverables = deliverables.filter((deliverable) =>
    deliverable.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deliverable.request.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Deliverables Management</h1>
            <p className="text-muted-foreground">
              Manage all uploaded deliverables for student requests
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Deliverable
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by file name or request title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Deliverable</DialogTitle>
              <DialogDescription>
                Upload a deliverable for a student request
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestId">Request ID *</Label>
                <Input
                  id="requestId"
                  required
                  placeholder="Enter request ID (e.g., cmk4f5s00002m0gdkfq47ubx)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.zip,.mp3,.wav"
                />
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, ZIP, MP3, WAV (Max 50MB)
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deliverables Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Deliverables</CardTitle>
            <CardDescription>
              {filteredDeliverables.length === 0
                ? "No deliverables found"
                : `Showing ${filteredDeliverables.length} deliverable${filteredDeliverables.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDeliverables.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Deliverables Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No deliverables match your search"
                    : "No deliverables have been uploaded yet"}
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Deliverable
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Request</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliverables.map((deliverable) => (
                      <TableRow key={deliverable.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{deliverable.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{deliverable.request.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{deliverable.user.name}</div>
                            <div className="text-xs text-muted-foreground">{deliverable.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {deliverable.fileType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {(deliverable.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(deliverable.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <a
                              href={deliverable.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(deliverable.id)}
                              className="text-destructive hover:text-destructive"
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
      </div>
    </AdminDashboardLayout>
  )
}
