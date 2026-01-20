"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react" // Ensure this is imported
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CheckCircle2, ArrowLeft, Upload, AlertCircle, Building2, CreditCard, Info, Check, Zap, Copy, FileText, Loader2, X, ArrowRight } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

interface TempRequest {
  serviceId: string
  title: string
  instructions: string
  academicLevel: string
  deadline: string
  notes: string
  files: Array<{ name: string; size: number; type: string }>
}

interface ServiceDetails {
  price: number
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.12 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rate: 277.80 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.50 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
]

const steps = [
  {
    number: 1,
    title: "Select Service",
    description: "Choose the academic service",
  },
  {
    number: 2,
    title: "Details",
    description: "Fill request & instructions",
  },
  {
    number: 3,
    title: "Payment",
    description: "Secure payment process",
  },
  {
    number: 4,
    title: "Done",
    description: "Access dashboard & result",
  },
]

export default function PaymentInstructionsPage() {
  const router = useRouter()
  const { data: session } = useSession() // Added session check
  
  const [tempRequest, setTempRequest] = useState<TempRequest | null>(null)
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null)
  const [settings, setSettings] = useState<{ payment_instructions: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [referenceNumber, setReferenceNumber] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  const baseAmount = serviceDetails?.price || 50
  const convertedAmount = baseAmount * selectedCurrencyData.rate

  // Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showSuccessModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      router.push("/student/dashboard")
    }
    return () => clearInterval(interval)
  }, [showSuccessModal, countdown, router])

  useEffect(() => {
    const stored = localStorage.getItem("tempRequest")
    if (stored) {
      const request = JSON.parse(stored)
      setTempRequest(request)
      if (request.serviceId) {
        fetchServicePrice(request.serviceId)
      }
    }
    fetchSettings()
  }, [])

  const fetchServicePrice = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`)
      if (response.ok) {
        const service = await response.json()
        setServiceDetails({ price: service.price || 50 })
      }
    } catch (error) {
      console.error("Error fetching service price:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings?category=payment")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.find((s: any) => s.key === "payment_instructions") || { payment_instructions: "" })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }
      setReceiptFile(file)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmed) return toast.error("Please confirm you have made a payment")
    if (!receiptFile) return toast.error("Please upload your payment receipt")
    if (!referenceNumber.trim()) return toast.error("Please enter your payment reference number")

    setIsSubmitting(true)

    try {
      const fileFormData = new FormData()
      fileFormData.append("file", receiptFile)
      fileFormData.append("tempRequestId", "pending-payment")

      const fileResponse = await fetch("/api/files/upload-temp", { method: "POST", body: fileFormData })
      if (!fileResponse.ok) throw new Error("Failed to upload receipt")
      const uploadedFile = await fileResponse.json()

      localStorage.setItem("pendingPayment", JSON.stringify({
        tempRequest,
        payment: {
          receiptUrl: uploadedFile.fileUrl,
          referenceNumber,
          amount: convertedAmount,
          currency: selectedCurrency,
        }
      }))

      toast.success("Payment receipt uploaded!")

      // LOGIC CHANGE: Check if logged in
      if (session) {
        // User is logged in, process immediately
        await createRequestAfterAuth()
      } else {
        // User is not logged in, show Auth Modal
        setShowAuthModal(true)
        setPaymentSubmitted(true)
      }

    } catch (error) {
      console.error("Error submitting payment:", error)
      toast.error("Failed to submit payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    createRequestAfterAuth()
  }

  const createRequestAfterAuth = async () => {
    const pendingData = localStorage.getItem("pendingPayment")
    if (!pendingData) {
      toast.error("Payment data not found. Please start over.")
      localStorage.removeItem("tempRequest")
      router.push("/quick-apply")
      return
    }
    const { tempRequest, payment } = JSON.parse(pendingData)

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: tempRequest.serviceId,
          title: tempRequest.title,
          instructions: tempRequest.instructions,
          academicLevel: tempRequest.academicLevel,
          deadline: tempRequest.deadline,
          notes: tempRequest.notes,
        }),
      })
      if (!response.ok) throw new Error("Failed to create request")
      const request = await response.json()

      if (tempRequest.files.length > 0) {
        for (const fileData of tempRequest.files) {
          await fetch("/api/files/create-from-temp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId: request.id,
              fileName: fileData.name,
              fileSize: fileData.size,
              fileType: fileData.type,
            }),
          })
        }
      }

      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          amount: payment.amount,
          currency: payment.currency,
          receiptUrl: payment.receiptUrl,
          referenceNumber: payment.referenceNumber,
        }),
      })

      localStorage.removeItem("tempRequest")
      localStorage.removeItem("pendingPayment")
      
      setShowSuccessModal(true)
      toast.success("Request submitted successfully!")
      
    } catch (error) {
      console.error("Error creating request after auth:", error)
      toast.error("Failed to complete request. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 flex justify-center">
          <Skeleton className="h-12 w-96 mb-4" />
        </div>
      </PublicLayout>
    )
  }

  if (!tempRequest) {
    return (
      <PublicLayout>
        <div className="container py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">No Request Found</h1>
          <Button onClick={() => router.push("/quick-apply")} className="mt-4">
            Start New Request
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Only show Auth Modal if NOT logged in */}
      {!session && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      )}
      
      {/* SUCCESS MODAL OVERLAY */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your application has been successfully submitted. You will receive a notification once your request has been reviewed, <span className="text-foreground font-medium">approved, or disapproved</span>.
            </p>

            <div className="w-full bg-secondary rounded-full h-1.5 mb-4 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000 ease-linear" 
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>

            <div className="text-sm text-muted-foreground mb-6 font-mono">
              Redirecting in {countdown}s...
            </div>

            <Button 
              onClick={() => {
                setCountdown(0)
                router.push("/student/dashboard")
              }} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
      
      <div className="container py-12 min-h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-16 space-y-2 animate-fade-up">
          <h1 className="text-4xl font-bold tracking-tight">
            Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Payment</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Secure your request by completing the bank transfer and uploading the receipt.
          </p>
        </div>

        {/* STEPPER (Step 3 Active) */}
        <div className="max-w-5xl mx-auto w-full mb-16 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="relative">
            <div className="absolute top-6 left-0 w-full h-[2px] bg-muted rounded-full" />
            <div className="absolute top-6 left-0 h-[2px] rounded-full bg-gradient-to-r from-primary via-blue-600 to-primary transition-all duration-700 ease-out" style={{ width: "80%" }} />

            <div className="relative grid grid-cols-4 gap-4">
              {steps.map((step, index) => {
                const isStep1 = index === 0
                const isStep2 = index === 1
                const isStep3 = index === 2
                
                const isActive = isStep3
                const isCompleted = isStep1 || isStep2
                const isUpcoming = index > 2

                return (
                  <div key={step.number} className="flex flex-col items-center text-center group">
                    <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isActive ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110" : isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground group-hover:border-primary/40"}`}>
                      {isActive ? <CreditCard className="h-5 w-5" /> : isCompleted ? <Check className="h-5 w-5" /> : <span className="font-semibold text-sm">{step.number}</span>}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className={`text-sm font-semibold transition-colors ${(isActive || isCompleted) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{step.title}</p>
                      <p className="text-xs text-muted-foreground hidden md:block max-w-[120px]">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto w-full flex-1">
          
          {/* LEFT COLUMN: Summary */}
          <div className="lg:col-span-5 space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Card className="border-t-4 border-t-primary/50 shadow-sm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Service</Label>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{tempRequest.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{tempRequest.instructions}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Level</Label>
                    <p className="font-medium">{tempRequest.academicLevel}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Deadline</Label>
                    <p className="font-medium">{new Date(tempRequest.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Currency</Label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled={paymentSubmitted}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-xl border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount Due</p>
                    <div className="text-3xl font-bold text-primary tracking-tight">
                      {selectedCurrencyData.symbol}{convertedAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Estimated Base: ${baseAmount} USD
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Payment Instructions & Upload */}
          <div className="lg:col-span-7 space-y-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
            
            {/* Bank Details */}
            <Card className="border-t-4 border-t-blue-500/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Bank Transfer Details
                </CardTitle>
                <CardDescription>Please transfer the exact amount shown in the summary.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-5 rounded-lg space-y-3 border border-border/50">
                  <BankDetailRow label="Bank Name" value="ABC Bank" />
                  <BankDetailRow label="Account Name" value="Eduforge Services" />
                  <BankDetailRow label="Account Number" value="123456789" monospace />
                  <BankDetailRow label="Routing Number" value="021000021" monospace />
                  <BankDetailRow label="SWIFT / IBAN" value="ABCDUS33" monospace />
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> Use a unique reference ID for faster verification.
                    <div className="mt-1 font-mono text-xs bg-blue-100 dark:bg-blue-900/50 inline-block px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                      REF: EDU{Date.now().toString().slice(-6)}
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Upload Receipt */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Submit Proof of Payment</CardTitle>
                <CardDescription>Upload your transaction receipt to activate your order.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Transaction Reference #</Label>
                    <div className="relative">
                      <Input
                        id="referenceNumber"
                        placeholder="e.g. TRX-99887766"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="pl-10 h-11"
                        disabled={paymentSubmitted}
                      />
                      <div className="absolute left-3 top-3 text-muted-foreground">
                        <HashIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Receipt Image / PDF</Label>
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${receiptFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
                      <input
                        id="receipt"
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={paymentSubmitted}
                      />
                      <label htmlFor="receipt" className="cursor-pointer block w-full h-full">
                        {receiptFile ? (
                          <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <p className="font-medium text-foreground">{receiptFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Click to upload receipt</p>
                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG (Max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="confirm"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary"
                      disabled={paymentSubmitted}
                    />
                    <label htmlFor="confirm" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      I confirm that I have successfully transferred <span className="font-bold text-foreground">{selectedCurrencyData.symbol}{convertedAmount.toFixed(2)}</span> to the bank account above.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting || paymentSubmitted}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || paymentSubmitted || !confirmed || !receiptFile}
                      className="flex-[2] shadow-lg shadow-primary/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Confirm & Submit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground">
              Transactions usually process within 1-2 hours.
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

// Helper Component for neat bank rows
function BankDetailRow({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold text-foreground ${monospace ? "font-mono tracking-wide" : ""}`}>{value}</span>
    </div>
  )
}

// Simple icon for hash
function HashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}