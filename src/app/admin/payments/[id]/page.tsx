"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, DollarSign, Calendar, CheckCircle2, XCircle, AlertTriangle, Eye, FileText, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Separator } from "@radix-ui/react-dropdown-menu"

interface Payment {
  id: string
  referenceNumber: string
  amount: number
  currency: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW"
  receiptUrl: string
  rejectionReason?: string
  fraudFlagged?: boolean
  fraudNotes?: string
  createdAt: string
  reviewedAt?: string
  user: {
    id: string
    name: string
    email: string
  }
  request: {
    id: string
    title: string
    status: string
    service: {
      name: string
    }
  }
  dispute?: {
    id: string
    status: string
    explanation: string
    adminResponse?: string
  }
}

export default function AdminPaymentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: "",
    rejectionReason: "",
    fraudFlagged: false,
    fraudNotes: "",
  })

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchPayment()
  }, [session, router, params.id])

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/payments")
          return
        }
        throw new Error("Failed to fetch payment")
      }

      const data = await response.json()
      setPayment(data)
    } catch (error) {
      console.error("Error fetching payment:", error)
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      })
      router.push("/admin/payments")
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    setReviewing(true)

    try {
      const response = await fetch(`/api/payments/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: reviewData.status,
          rejectionReason: reviewData.status === "REJECTED" ? reviewData.rejectionReason : undefined,
          fraudFlagged: reviewData.fraudFlagged,
          fraudNotes: reviewData.fraudFlagged ? reviewData.fraudNotes : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to update payment")

      toast({
        title: "Payment Reviewed",
        description: `Payment has been ${reviewData.status.toLowerCase()}`,
      })

      setReviewing(false)

      // Refetch payment to get updated data
      fetchPayment()
    } catch (error) {
      console.error("Error reviewing payment:", error)
      toast({
        title: "Error",
        description: "Failed to review payment. Please try again.",
        variant: "destructive",
      })
      setReviewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { variant: "default", label: "Pending" },
      APPROVED: { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      UNDER_REVIEW: { variant: "secondary", label: "Under Review" },
    }
    const config = variants[status] || variants.PENDING
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

  if (!payment) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The payment you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.back()}>
            Back to Payments
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
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Payment Details</h1>
            <p className="text-muted-foreground">
              Reference: {payment.referenceNumber}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(payment.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {payment.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviewed On</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(payment.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {payment.fraudFlagged && (
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Flagged as Potential Fraud</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User & Request Information */}
          <Card>
            <CardHeader>
              <CardTitle>User & Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Student Name</div>
                    <div className="font-medium">{payment.user.name}</div>
                    <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Request</div>
                    <div className="font-medium">{payment.request.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {payment.request.status}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <a href={`/admin/requests/${payment.request.id}`}>
                    View Request
                  </a>
                </Button>
              </div>

              <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-medium">{payment.request.service.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Payment Receipt</DialogTitle>
                  <DialogDescription>
                    Reference: {payment.referenceNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full h-[600px] bg-muted flex items-center justify-center">
                  <img
                    src={payment.receiptUrl}
                    alt="Payment Receipt"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Dispute Information */}
        {payment.dispute && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Dispute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Dispute Status</div>
                <Badge variant={payment.dispute.status === "RESOLVED" ? "default" : "secondary"}>
                  {payment.dispute.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Student Explanation</div>
                <p className="text-sm">{payment.dispute.explanation}</p>
              </div>

              {payment.dispute.adminResponse && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Admin Response</div>
                    <p className="text-sm">{payment.dispute.adminResponse}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              {payment.status === "PENDING"
                ? "Review this payment to approve or reject"
                : payment.status === "APPROVED"
                ? "This payment has been approved"
                : payment.status === "REJECTED"
                ? "This payment was rejected"
                : "This payment is under review"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payment.status === "PENDING" && (
              <form onSubmit={(e) => { e.preventDefault(); handleReview(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Decision *</Label>
                  <Select
                    value={reviewData.status}
                    onValueChange={(value) => setReviewData({ ...reviewData, status: value })}
                    disabled={reviewing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Approve Payment
                        </div>
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Reject Payment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewData.status === "REJECTED" && (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                    <Textarea
                      id="rejectionReason"
                      value={reviewData.rejectionReason}
                      onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                      placeholder="Explain why this payment is being rejected..."
                      rows={3}
                      required
                      disabled={reviewing}
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fraudFlagged"
                      checked={reviewData.fraudFlagged}
                      onChange={(e) => setReviewData({ ...reviewData, fraudFlagged: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="fraudFlagged" className="text-sm">
                      Flag as Potential Fraud
                    </Label>
                  </div>
                </div>

                {reviewData.fraudFlagged && (
                  <div className="space-y-2">
                    <Label htmlFor="fraudNotes">Fraud Notes *</Label>
                    <Textarea
                      id="fraudNotes"
                      value={reviewData.fraudNotes}
                      onChange={(e) => setReviewData({ ...reviewData, fraudNotes: e.target.value })}
                      placeholder="Describe suspicious activity..."
                      rows={2}
                      required
                      disabled={reviewing}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={reviewing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!reviewData.status || reviewing}
                  >
                    {reviewing ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            )}

            {payment.status !== "PENDING" && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  This payment has already been {payment.status.toLowerCase().replace("_", " ")}.
                </p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                  Back to Payments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
