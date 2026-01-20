"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, DollarSign, Calendar, FileText, Download, AlertCircle, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Payment {
  id: string
  referenceNumber: string
  amount: number
  currency: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW"
  receiptUrl: string
  rejectionReason?: string
  fraudFlagged?: boolean
  createdAt: string
  reviewedAt?: string
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

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchPayment()
  }, [session, router, params.id])

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/student/payments")
          return
        }
        throw new Error("Failed to fetch payment")
      }

      const data = await response.json()
      setPayment(data)
    } catch (error) {
      console.error("Error fetching payment:", error)
      router.push("/student/payments")
    } finally {
      setLoading(false)
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
      <StudentDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (!payment) {
    return (
      <StudentDashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The payment you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/student/payments">Back to Payments</Link>
          </Button>
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/student/payments">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payment Details</h1>
            <p className="text-muted-foreground">
              Reference: {payment.referenceNumber}
            </p>
          </div>
        </div>

        {/* Payment Status Banner */}
        {payment.status === "APPROVED" && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200">Payment Approved</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your payment has been approved. Your request is now being processed.
            </AlertDescription>
          </Alert>
        )}

        {payment.status === "REJECTED" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Rejected</AlertTitle>
            <AlertDescription>
              {payment.rejectionReason || "Your payment was rejected. Please review the reason and submit again."}
            </AlertDescription>
          </Alert>
        )}

        {payment.status === "UNDER_REVIEW" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Under Review</AlertTitle>
            <AlertDescription>
              Your payment dispute is currently being reviewed by our team.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">
                    {payment.amount.toFixed(2)} {payment.currency}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(payment.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {payment.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviewed On</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(payment.reviewedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {payment.fraudFlagged && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This payment was flagged for fraud detection and is under review.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Request Title</span>
                <div className="flex items-center gap-2 text-right max-w-xs">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{payment.request.title}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{payment.request.service.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Request Status</span>
                <Badge>{payment.request.status}</Badge>
              </div>

              <Separator />

              <Button asChild className="w-full mt-4">
                <Link href={`/student/requests/${payment.request.id}`}>
                  View Request Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Receipt */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Receipt</CardTitle>
            <CardDescription>
              Upload receipt used for this payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Payment Receipt</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-96">
                  <Image
                    src={payment.receiptUrl}
                    alt="Payment receipt"
                    fill
                    className="object-contain"
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
              <CardTitle>Dispute Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Your Explanation</h4>
                <p className="text-muted-foreground">{payment.dispute.explanation}</p>
              </div>

              {payment.dispute.adminResponse && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Admin Response</h4>
                    <p className="text-muted-foreground">{payment.dispute.adminResponse}</p>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{payment.dispute.status}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {payment.status === "REJECTED" && !payment.dispute && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Payment Rejected</CardTitle>
              <CardDescription>
                If you believe this rejection was incorrect, you can file a dispute.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/student/payments/${payment.id}/dispute`}>
                  <Upload className="mr-2 h-4 w-4" />
                  File a Dispute
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
