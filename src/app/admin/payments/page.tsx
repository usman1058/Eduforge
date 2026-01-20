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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, DollarSign, Calendar, CheckCircle2, XCircle, AlertTriangle, Eye, FileText, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface Payment {
  id: string
  referenceNumber: string
  amount: number
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
  }
  dispute?: {
    id: string
    status: string
  }
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [reviewingPayment, setReviewingPayment] = useState<Payment | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null)

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

    fetchPayments()
  }, [session, router])

  const fetchPayments = async () => {
    try {
      const status = statusFilter !== "all" ? statusFilter : undefined
      const response = await fetch(`/api/payments${status ? `?status=${status}` : ""}`)

      if (!response.ok) throw new Error("Failed to fetch payments")

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const openReviewDialog = (payment: Payment) => {
    setReviewingPayment(payment)
    setReviewData({
      status: payment.status,
      rejectionReason: "",
      fraudFlagged: payment.fraudFlagged || false,
      fraudNotes: payment.fraudNotes || "",
    })
    setReviewDialogOpen(true)
  }

  const openReceiptDialog = (payment: Payment) => {
    setViewingReceipt(payment)
    setReceiptDialogOpen(true)
  }

  const handleReview = async () => {
    if (!reviewingPayment || !reviewData.status) return

    try {
      const response = await fetch(`/api/payments/${reviewingPayment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) throw new Error("Failed to review payment")

      toast({
        title: "Payment Reviewed",
        description: `Payment has been ${reviewData.status.toLowerCase()}.`,
      })

      setReviewDialogOpen(false)
      setReviewingPayment(null)
      fetchPayments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review payment. Please try again.",
        variant: "destructive",
      })
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

  const filteredPayments = payments.filter((payment) =>
    payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Payments Management</h1>
            <p className="text-muted-foreground">
              Review and approve payment receipts
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, title, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>
              {filteredPayments.length === 0
                ? "No payments found"
                : `Showing ${filteredPayments.length} payment${filteredPayments.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "No payments have been submitted yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Request</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{payment.request.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{payment.user.name || "-"}</div>
                              <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                          {payment.fraudFlagged && (
                            <Badge variant="destructive" className="ml-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Fraud
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReceiptDialog(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => openReviewDialog(payment)}
                              >
                                Review
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                                <a href={`/admin/payments/${payment.id}`}>Details</a>
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

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Payment</DialogTitle>
              <DialogDescription>
                Reference: {reviewingPayment?.referenceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Decision</Label>
                <Select value={reviewData.status} onValueChange={(value) => setReviewData({ ...reviewData, status: value })}>
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
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                    placeholder="Explain why this payment is being rejected..."
                    rows={3}
                    required={reviewData.status === "REJECTED"}
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="fraudFlagged" className="cursor-pointer">Flag as Fraud</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark if payment appears suspicious
                  </p>
                </div>
                <Switch
                  id="fraudFlagged"
                  checked={reviewData.fraudFlagged}
                  onCheckedChange={(checked) => setReviewData({ ...reviewData, fraudFlagged: checked })}
                />
              </div>

              {reviewData.fraudFlagged && (
                <div className="space-y-2">
                  <Label>Fraud Notes</Label>
                  <Textarea
                    value={reviewData.fraudNotes}
                    onChange={(e) => setReviewData({ ...reviewData, fraudNotes: e.target.value })}
                    placeholder="Describe suspicious activity..."
                    rows={2}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReview}
                  disabled={!reviewData.status}
                  className="flex-1"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Viewer Dialog */}
        <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>
                {viewingReceipt?.referenceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-96">
              <Image
                src={viewingReceipt?.receiptUrl || ""}
                alt="Payment receipt"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
