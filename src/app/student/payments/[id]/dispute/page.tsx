"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  referenceNumber: string
  amount: number
  status: string
  rejectionReason?: string
  request: {
    id: string
    title: string
  }
  dispute?: {
    id: string
    status: string
    explanation: string
    adminResponse?: string
  }
}

export default function PaymentDisputePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [explanation, setExplanation] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!explanation.trim()) {
      toast({
        title: "Error",
        description: "Please provide an explanation for the dispute.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/payments/${params.id}/dispute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          explanation,
          additionalFiles: uploadedFiles.map((f) => f.name).join(","),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit dispute")
      }

      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted and will be reviewed by our team.",
      })

      router.push(`/student/payments/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit dispute. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
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

  // If payment is not rejected or already has a dispute
  if (payment.status !== "REJECTED" || payment.dispute) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/student/payments/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Payment Dispute</h1>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {payment.status !== "REJECTED"
                ? "You can only file disputes for rejected payments."
                : "A dispute has already been filed for this payment."}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium">{payment.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request</span>
                  <span className="font-medium">{payment.request.title}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button asChild>
            <Link href={`/student/payments/${params.id}`}>
              Back to Payment Details
            </Link>
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
            <Link href={`/student/payments/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">File Payment Dispute</h1>
            <p className="text-muted-foreground">
              Reference: {payment.referenceNumber}
            </p>
          </div>
        </div>

        {/* Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please provide a detailed explanation of why you believe the payment rejection was incorrect.
            Our team will review your dispute and get back to you within 24-48 hours.
          </AlertDescription>
        </Alert>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference Number</span>
                <span className="font-medium">{payment.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request</span>
                <span className="font-medium">{payment.request.title}</span>
              </div>
              {payment.rejectionReason && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejection Reason</span>
                    <span className="text-destructive">{payment.rejectionReason}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispute Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Details</CardTitle>
            <CardDescription>
              Provide information about why the payment was rejected incorrectly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation *</Label>
                <Textarea
                  id="explanation"
                  required
                  placeholder="Please explain why you believe this payment rejection was incorrect. Include any relevant details..."
                  rows={6}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Documents (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Select Files</span>
                    </Button>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Uploaded Files</Label>
                    {uploadedFiles.map((file, index) => (
                      <Alert key={index}>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Dispute"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  )
}
