"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle2, ArrowRight, Sparkles, Clock, DollarSign, ShieldCheck, FileText, Layout, Info, Phone, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const workTypes = [
  { value: "custom-essay", label: "Custom Essay", icon: FileText },
  { value: "research-project", label: "Research Project", icon: Layout },
  { value: "thesis-dissertation", label: "Thesis/Dissertation", icon: FileText },
  { value: "case-study", label: "Case Study", icon: Layout },
  { value: "presentation", label: "Presentation", icon: Layout },
  { value: "data-analysis", label: "Data Analysis", icon: Layout },
  { value: "editing-proofreading", label: "Editing & Proofreading", icon: FileText },
  { value: "other", label: "Other", icon: Sparkles },
]

export default function CustomQuotePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedWorkType, setSelectedWorkType] = useState("")

  const [formData, setFormData] = useState({
    workType: "",
    title: "",
    description: "",
    deadline: "",
    budget: "",
    email: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("workType", selectedWorkType)
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("deadline", formData.deadline)
      submitData.append("budget", formData.budget)
      submitData.append("email", formData.email)
      submitData.append("phone", formData.phone)

      uploadedFiles.forEach((file) => {
        submitData.append("files", file)
      })

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit quote request")
      }

      toast({
        title: "Quote Request Submitted",
        description: "We'll review your request and get back to you soon.",
      })

      router.push("/contact")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  return (
    <PublicLayout>
      <div className="container max-w-6xl py-12 min-h-[calc(100vh-5rem)] flex flex-col items-center">
        
        {/* HERO SECTION */}
        <div className="text-center mb-12 w-full animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Custom Quote</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Have a unique project? Share details and receive a tailored proposal from our experts.
          </p>
        </div>

        {/* GRID LAYOUT: Form (Left) + Sidebar (Right) */}
        <div className="grid lg:grid-cols-12 gap-12 w-full animate-fade-up" style={{ animationDelay: '100ms' }}>
          
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-xl border-border/50">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Fill out the sections below to help us understand your requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Work Type Grid */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">What type of work do you need?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {workTypes.map((type) => {
                        const Icon = type.icon
                        const isSelected = selectedWorkType === type.value
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setSelectedWorkType(type.value)
                              setFormData({ ...formData, workType: type.value })
                            }}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all duration-200 hover:border-primary/50
                              ${isSelected 
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                                : "bg-card text-muted-foreground hover:bg-muted/50"
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                            {type.label}
                          </button>
                        )
                      })}
                    </div>
                    {!selectedWorkType && (
                       <p className="text-xs text-destructive animate-in fade-in">Please select a work type to continue.</p>
                    )}
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-semibold">Project Title *</Label>
                      <Input
                        id="title"
                        required
                        placeholder="e.g., Thesis on Machine Learning Algorithms"
                        className="h-11"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-semibold">Detailed Requirements *</Label>
                      <Textarea
                        id="description"
                        required
                        placeholder="Describe scope of work, specific instructions, formatting guidelines, etc..."
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Timeline & Budget */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-base font-semibold">Deadline *</Label>
                      <div className="relative">
                        <Input
                          id="deadline"
                          type="date"
                          required
                          className="h-11"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                        <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-base font-semibold">Budget Range (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="budget"
                          type="number"
                          placeholder="e.g. 200"
                          className="h-11 pl-8"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Optional, helps us match experts.</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Upload */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Supporting Documents</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.zip,.mp3,.wav"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block h-full w-full">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, ZIP, MP3 (Max 20MB)</p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <Alert key={index} className="bg-muted/50 border-0 py-3">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <AlertDescription className="flex items-center justify-between">
                              <span className="truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

                  <Separator />

                  {/* Contact */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="h-11"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-11"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-base h-12" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Quote Request
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      By submitting this form, you agree to our Terms of Service.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (Restored) */}
          <div className="lg:col-span-4 space-y-6">
            
            <Card className="bg-muted/30 border-none shadow-sm ">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Response Time
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Most custom quotes are reviewed and sent to your email within <span className="font-bold text-foreground">24 hours</span> during business days.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Confidentiality Guaranteed
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your project details and personal information are kept strictly confidential and secure.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-md ">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-4">Why Choose Custom?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Tailored Pricing</p>
                      <p className="text-xs text-muted-foreground">Quotes based on exact needs.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Expert Matching</p>
                      <p className="text-xs text-muted-foreground">We find the best specialist.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">No Obligation</p>
                      <p className="text-xs text-muted-foreground">Review quote before paying.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10 shadow-sm  ">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Need Help?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team instantly for urgent inquiries.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </PublicLayout>
  )
}