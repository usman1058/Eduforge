"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, CheckCircle2, XCircle, Clock, User, FileText, Download, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface File {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

interface Deliverable {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  description?: string
  createdAt: string
}

interface RequestDetail {
  id: string
  title: string
  instructions: string
  academicLevel: string
  deadline: string
  notes?: string
  status: string
  createdAt: string
  service: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  payment?: {
    id: string
    status: string
    amount: number
    receiptUrl: string
  }
  files: File[]
  deliverables: Deliverable[]
}

const statusOptions = [
  { value: "CREATED", label: "Created" },
  { value: "PAYMENT_SUBMITTED", label: "Payment Submitted" },
  { value: "PAYMENT_APPROVED", label: "Payment Approved" },
  { value: "PAYMENT_REJECTED", label: "Payment Rejected" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CLOSED", label: "Closed" },
]

export default function AdminRequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const [newStatus, setNewStatus] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [internalNotes, setInternalNotes] = useState("")

  const [uploadData, setUploadData] = useState({
    fileName: "",
    fileUrl: "",
    fileType: "pdf",
    description: "",
  })

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchRequest()
  }, [session, router, params.id])

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/requests")
          return
        }
        throw new Error("Failed to fetch request")
      }

      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error("Error fetching request:", error)
      router.push("/admin/requests")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) return

    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === "PAYMENT_REJECTED" || newStatus === "CLOSED" ? rejectionReason : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Status Updated",
        description: `Request status has been updated to ${newStatus}.`,
      })

      setStatusDialogOpen(false)
      setNewStatus("")
      setRejectionReason("")
      fetchRequest()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUploadDeliverable = async () => {
    setUploading(true)

    try {
      const response = await fetch("/api/deliverables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: params.id,
          ...uploadData,
        }),
      })

      if (!response.ok) throw new Error("Failed to upload deliverable")

      toast({
        title: "Deliverable Uploaded",
        description: "File has been uploaded successfully.",
      })

      setUploadDialogOpen(false)
      setUploadData({
        fileName: "",
        fileUrl: "",
        fileType: "pdf",
        description: "",
      })

      // Automatically update status to delivered if not already
      if (request?.status !== "DELIVERED") {
        await fetch(`/api/requests/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "DELIVERED" }),
        })
      }

      fetchRequest()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload deliverable. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      CREATED: { variant: "default", label: "Created" },
      PAYMENT_SUBMITTED: { variant: "secondary", label: "Payment Submitted" },
      PAYMENT_APPROVED: { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Payment Approved" },
      PAYMENT_REJECTED: { variant: "destructive", label: "Payment Rejected" },
      IN_PROGRESS: { variant: "secondary", label: "In Progress" },
      DELIVERED: { variant: "default", className: "bg-blue-500 hover:bg-blue-600", label: "Delivered" },
      CLOSED: { variant: "outline", label: "Closed" },
    }
    const config = variants[status] || variants.CREATED
    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (!request) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
          <Button onClick={() => router.push("/admin/requests")}>
            Back to Requests
          </Button>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <p className="text-muted-foreground">
              Request #{request.id.slice(0, 8)}...
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* Request Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{request.service.name}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deadline</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(request.deadline).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Level</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{request.academicLevel}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Request Details</TabsTrigger>
            <TabsTrigger value="files">Uploaded Files</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="student">Student Info</TabsTrigger>
          </TabsList>

          {/* Request Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Instructions</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{request.instructions}</p>
                </div>

                {request.notes && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Additional Notes</h4>
                      <p className="text-muted-foreground">{request.notes}</p>
                    </div>
                  </>
                )}

                <div className="text-sm text-muted-foreground">
                  Created: {new Date(request.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {request.payment && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(request.payment.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">${request.payment.amount.toFixed(2)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/admin/payments/${request.payment!.id}`)}
                  >
                    View Payment Details
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Request Status</DialogTitle>
                      <DialogDescription>
                        Change the status of this request.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>New Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(newStatus === "PAYMENT_REJECTED" || newStatus === "CLOSED") && (
                        <div className="space-y-2">
                          <Label>Rejection Reason</Label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Internal Notes (Optional)</Label>
                        <Textarea
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                          placeholder="Notes for internal reference..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setStatusDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateStatus}
                          disabled={!newStatus}
                          className="flex-1"
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Deliverable
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Deliverable</DialogTitle>
                      <DialogDescription>
                        Upload the completed work for this request.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>File Name</Label>
                        <Input
                          value={uploadData.fileName}
                          onChange={(e) =>
                            setUploadData({ ...uploadData, fileName: e.target.value })
                          }
                          placeholder="e.g., Final_essay.pdf"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>File URL</Label>
                        <Input
                          value={uploadData.fileUrl}
                          onChange={(e) =>
                            setUploadData({ ...uploadData, fileUrl: e.target.value })
                          }
                          placeholder="Enter file URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>File Type</Label>
                        <Select
                          value={uploadData.fileType}
                          onValueChange={(value) =>
                            setUploadData({ ...uploadData, fileType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">Word Document</SelectItem>
                            <SelectItem value="zip">ZIP Archive</SelectItem>
                            <SelectItem value="mp3">Audio (MP3)</SelectItem>
                            <SelectItem value="wav">Audio (WAV)</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={uploadData.description}
                          onChange={(e) =>
                            setUploadData({ ...uploadData, description: e.target.value })
                          }
                          placeholder="File description..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setUploadDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUploadDeliverable}
                          disabled={uploading || !uploadData.fileName || !uploadData.fileUrl}
                          className="flex-1"
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  Files uploaded by the student for this request
                </CardDescription>
              </CardHeader>
              <CardContent>
                {request.files.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No files uploaded
                  </div>
                ) : (
                  <div className="space-y-3">
                    {request.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{file.fileName}</div>
                            <div className="text-sm text-muted-foreground">
                              {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deliverables</CardTitle>
                    <CardDescription>
                      Files uploaded by admin for this request
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {request.deliverables.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No deliverables uploaded yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {request.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{deliverable.fileName}</div>
                            {deliverable.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {deliverable.description}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">
                              Uploaded {new Date(deliverable.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Info Tab */}
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{request.user.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{request.user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{request.user.phone || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Member Since</div>
                    <div className="font-medium">-</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/users/${request.user.id}`)}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )
}
