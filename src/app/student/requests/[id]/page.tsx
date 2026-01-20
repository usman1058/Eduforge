"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react"

interface Request {
  id: string
  title: string
  instructions: string
  academicLevel: string
  deadline: string
  notes: string | null
  status: string
  createdAt: string
  deliveredAt: string | null
  closedAt: string | null
  service: {
    id: string
    name: string
    pricingNote: string
  }
  payment?: {
    id: string
    status: string
    amount: number
    rejectionReason: string | null
  }
  files: Array<{
    id: string
    fileName: string
    fileUrl: string
    createdAt: string
  }>
  deliverables: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    description: string | null
    createdAt: string
  }>
}

export default function StudentRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [request, setRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/requests/${requestId}`)
        if (response.ok) {
          const data = await response.json()
          setRequest(data)
        } else {
          setError("Failed to load request")
        }
      } catch (error) {
        console.error("Error fetching request:", error)
        setError("Failed to load request")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [requestId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CLOSED":
        return "default"
      case "IN_PROGRESS":
        return "secondary"
      case "PAYMENT_APPROVED":
        return "outline"
      case "PAYMENT_REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CLOSED":
      case "PAYMENT_APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "IN_PROGRESS":
      case "PAYMENT_SUBMITTED":
        return <Clock className="h-4 w-4" />
      case "PAYMENT_REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </StudentDashboardLayout>
    )
  }

  if (error || !request) {
    return (
      <StudentDashboardLayout>
        <div className="container py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">{error || "Request not found"}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" asChild>
                <Link href="/student/requests">My Requests</Link>
              </Button>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  const canAccessDeliverables =
    request.status === "DELIVERED" || request.status === "CLOSED"

  return (
    <StudentDashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link
              href="/student/requests"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{request.title}</h1>
              <Badge className={getStatusColor(request.status)}>
                {getStatusIcon(request.status)} {request.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Service</div>
                <div className="font-medium">{request.service.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Academic Level</div>
                <div className="font-medium">{request.academicLevel}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Deadline</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.deadline).toLocaleString()}
                </div>
              </div>
            </div>

            {request.deliveredAt && (
              <div>
                <div className="text-sm text-muted-foreground">Delivered</div>
                <div className="font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {new Date(request.deliveredAt).toLocaleString()}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Instructions</div>
              <p className="text-sm whitespace-pre-wrap">{request.instructions}</p>
            </div>

            {request.notes && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Additional Notes</div>
                  <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        {request.payment && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="text-2xl font-bold">${request.payment.amount}</div>
                </div>
                <Badge className={getStatusColor(request.payment.status)}>
                  {getStatusIcon(request.payment.status)} {request.payment.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {request.payment.rejectionReason && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-destructive mb-1">Rejection Reason</div>
                      <p className="text-sm text-muted-foreground">
                        {request.payment.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.payment.status === "REJECTED" && (
                <Button asChild>
                  <Link href={`/student/payments/${request.payment.id}/dispute`}>
                    File a Dispute
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs for Files and Deliverables */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">
              Uploaded Files ({request.files.length})
            </TabsTrigger>
            <TabsTrigger value="deliverables">
              Deliverables ({request.deliverables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Your Uploaded Files</CardTitle>
                <CardDescription>
                  Files you submitted with this request
                </CardDescription>
              </CardHeader>
              <CardContent>
                {request.files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No files uploaded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {request.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{file.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(file.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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

          <TabsContent value="deliverables">
            <Card>
              <CardHeader>
                <CardTitle>Delivered Solutions</CardTitle>
                <CardDescription>
                  {canAccessDeliverables
                    ? "Your completed work is ready for download"
                    : "Deliverables will be available after payment is approved"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!canAccessDeliverables && request.deliverables.length === 0 ? (
                  <div className="text-center py-8">
                    <LockIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Deliverables are locked until your payment is approved
                    </p>
                    {request.payment?.status === "PENDING" && (
                      <p className="text-sm text-muted-foreground">
                        Your payment is currently being reviewed
                      </p>
                    )}
                  </div>
                ) : request.deliverables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No deliverables yet. Check back later.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {request.deliverables.map((deliverable) => (
                      <Card key={deliverable.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium mb-1">
                                {deliverable.fileName}
                              </div>
                              {deliverable.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {deliverable.description}
                                </p>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(deliverable.createdAt).toLocaleString()} •{" "}
                                {(deliverable.fileSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <Button asChild>
                              <a
                                href={deliverable.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <Link href={`/student/tickets/new?requestId=${request.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Support Ticket
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
