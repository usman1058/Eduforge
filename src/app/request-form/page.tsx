"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Calendar, Upload, ArrowLeft, Info, CheckCircle2, Zap, FileText, CreditCard, Check } from "lucide-react"

interface Service {
  id: string
  name: string
  slug: string
  description: string
  price: number
}

interface RequestFormContentProps {
  serviceId: string | null
}

// Shared Stepper Configuration
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

function RequestFormContent({ serviceId }: RequestFormContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>(serviceId || "")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    academicLevel: "",
    deadline: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchServices() {
      try {
        // Simulate slight delay for smooth feel
        await new Promise(r => setTimeout(r, 300))
        const response = await fetch("/api/services?active=true")
        if (response.ok) {
          const data = await response.json()
          setServices(data)
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedService) {
      newErrors.service = "Please select a service"
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.instructions.trim()) {
      newErrors.instructions = "Instructions are required"
    }
    if (!formData.academicLevel) {
      newErrors.academicLevel = "Academic level is required"
    }
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required"
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate <= today) {
        newErrors.deadline = "Deadline must be in the future"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    try {
      // Store form data in localStorage for payment page
      const requestData = {
        serviceId: selectedService,
        title: formData.title,
        instructions: formData.instructions,
        academicLevel: formData.academicLevel,
        deadline: formData.deadline,
        notes: formData.notes,
        files: uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
      }

      localStorage.setItem("tempRequest", JSON.stringify(requestData))

      toast.success("Request details saved! Proceed to payment.")

      // Redirect to payment instructions page
      router.push(`/payment-instructions`)
    } catch (error) {
      console.error("Error processing request:", error)
      toast.error("Failed to process request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedServiceData = services.find(s => s.id === selectedService)

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-12 min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Breadcrumb */}
      <Link href="/quick-apply" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 w-fit group">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Quick Apply
      </Link>

      {/* Header */}
      <div className="text-center mb-12 space-y-2 animate-fade-up">
        <h1 className="text-4xl font-bold tracking-tight">
          Fill Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Details</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Provide detailed instructions to help our experts deliver the best result.
        </p>
      </div>

      {/* UPDATED STEPPER (Step 2 Active) */}
      <div className="max-w-5xl mx-auto w-full mb-16 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          {/* Base Line */}
          <div className="absolute top-6 left-0 w-full h-[2px] bg-muted rounded-full" />

          {/* Progress Line (Step 2 active → ~50% width) */}
          <div
            className="absolute top-6 left-0 h-[2px] rounded-full
            bg-gradient-to-r from-primary via-blue-600 to-primary
            transition-all duration-700 ease-out"
            style={{ width: "58%" }}
          />

          <div className="relative grid grid-cols-4 gap-4">
            {steps.map((step, index) => {
              // Hardcoded states for this specific page
              const isStep1 = index === 0
              const isStep2 = index === 1
              
              const isActive = isStep2
              const isCompleted = isStep1
              const isUpcoming = index > 1

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step Node */}
                  <div
                    className={`
                      z-10 flex items-center justify-center
                      w-12 h-12 rounded-full border-2
                      transition-all duration-300
                      ${isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110"
                        : isCompleted
                          ? "bg-primary border-primary text-primary-foreground" // Completed stays primary color
                          : "bg-background border-muted text-muted-foreground group-hover:border-primary/40"
                      }
                    `}
                  >
                    {isActive ? (
                      <FileText className="h-5 w-5" />
                    ) : isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold text-sm">{step.number}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-4 space-y-1">
                    <p
                      className={`text-sm font-semibold transition-colors
                          ${(isActive || isCompleted)
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                        }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block max-w-[120px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="max-w-3xl mx-auto w-full flex-1 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <Card className="border-t-4 border-t-primary/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Request Details</CardTitle>
            <CardDescription>
              Fill in the information below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Service Selection */}
              <div className="space-y-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <Label htmlFor="service" className="text-base font-medium">
                  Selected Service
                </Label>
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                  disabled={!!serviceId}
                >
                  <SelectTrigger id="service" className="h-11">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" /> {errors.service}
                  </p>
                )}
              </div>

              {/* Title & Instructions */}
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Request Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Research Paper on Climate Change"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`h-11 transition-colors focus-visible:ring-primary ${errors.title ? "border-destructive" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-base font-medium">
                    Detailed Instructions <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide detailed instructions for your assignment, including topic, requirements, formatting guidelines, word count, etc."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={6}
                    className={`transition-colors focus-visible:ring-primary ${errors.instructions ? "border-destructive" : ""}`}
                  />
                  {errors.instructions && (
                    <p className="text-sm text-destructive">{errors.instructions}</p>
                  )}
                </div>
              </div>

              {/* Level & Deadline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
                <div className="space-y-2">
                  <Label htmlFor="academicLevel" className="text-base font-medium">
                    Academic Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.academicLevel}
                    onValueChange={(value) => setFormData({ ...formData, academicLevel: value })}
                  >
                    <SelectTrigger id="academicLevel" className="h-11">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.academicLevel && (
                    <p className="text-sm text-destructive">{errors.academicLevel}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-base font-medium">
                    Deadline <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className={`pl-10 h-11 transition-colors focus-visible:ring-primary ${errors.deadline ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-sm text-destructive">{errors.deadline}</p>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3 animate-fade-up" style={{ animationDelay: '600ms' }}>
                <Label htmlFor="files" className="text-base font-medium">Supporting Documents</Label>
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer group">
                  <input
                    id="files"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.mp3,.wav"
                  />
                  <label htmlFor="files" className="cursor-pointer block">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, ZIP, MP3, WAV (Max 10MB per file)
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2 animate-fade-up" style={{ animationDelay: '700ms' }}>
                <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information or special requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="transition-colors focus-visible:ring-primary"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg flex gap-3 animate-fade-up" style={{ animationDelay: '800ms' }}>
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Submission Checklist</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Double-check spelling and instructions.</li>
                    <li>Ensure the deadline is realistic (min. 6 hours).</li>
                    <li>Reference materials (PDFs) help improve quality.</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 animate-fade-up" style={{ animationDelay: '900ms' }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()} 
                  className="h-11 px-8"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="h-11 px-8 flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <CreditCard className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RequestFormPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="container py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <RequestFormSuspense />
      </Suspense>
    </PublicLayout>
  )
}

function RequestFormSuspense() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")

  return <RequestFormContent serviceId={serviceId} />
}