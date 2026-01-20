"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  CheckCheck, 
  ShieldCheck, 
  Users, 
  Zap, 
  Info,
  Sparkles,
  ListTodo,
  AlertTriangle
} from "lucide-react"

interface Service {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string | null
  idealUseCase: string | null
  estimatedTurnaround: string | null
  price: number
  pricingNote: string
}

// Shared Icon helper (consistent with previous pages)
const getServiceIcon = (slug: string) => {
  const lowerSlug = slug.toLowerCase()
  if (lowerSlug.includes('essay')) return FileText
  if (lowerSlug.includes('paper')) return FileText
  if (lowerSlug.includes('dissertation')) return Sparkles
  return FileText
}

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchService() {
      try {
        setIsLoading(true)
        // Simulate slight delay for smooth animation
        await new Promise(r => setTimeout(r, 400))
        
        const response = await fetch("/api/services")
        if (response.ok) {
          const services = await response.json()
          const foundService = services.find((s: Service) => s.slug === slug)
          if (foundService) {
            setService(foundService)
          } else {
            setError("Service not found")
          }
        }
      } catch (error) {
        console.error("Error fetching service:", error)
        setError("Failed to load service")
      } finally {
        setIsLoading(false)
      }
    }

    fetchService()
  }, [slug])

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 min-h-[80vh]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Skeleton className="h-5 w-20 mb-4" />
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-80 w-full sticky top-6" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !service) {
    return (
      <PublicLayout>
        <div className="container py-12 text-center space-y-4">
          <h1 className="text-4xl font-bold">Service Not Found</h1>
          <p className="text-xl text-muted-foreground">
            {error || "The service you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <Link href="/services">Browse All Services</Link>
          </Button>
        </div>
      </PublicLayout>
    )
  }

  const Icon = getServiceIcon(service.slug)

  return (
    <PublicLayout>
      <div className="container py-12 min-h-[calc(100vh-5rem)]">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb */}
          <Link href="/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Services
          </Link>

          {/* HERO SECTION */}
          <div className="mb-12 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              {/* Icon */}
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 shrink-0">
                <Icon className="h-10 w-10" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {service.name}
                  </h1>
                  <Badge variant="secondary" className="hidden sm:flex h-8 items-center gap-1 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Active
                  </Badge>
                </div>
                
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  {service.description}
                </p>

                {/* Quick Stats Pills */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {service.estimatedTurnaround && (
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{service.estimatedTurnaround}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>Base: ${service.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>{service.pricingNote}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="mb-12" />

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* About Section */}
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Service Overview
                </h2>
                {service.longDescription ? (
                  <div className="prose prose-muted dark:prose-invert max-w-none text-muted-foreground leading-7">
                    <p>{service.longDescription}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-lg">{service.description}</p>
                )}
              </div>

              {/* Features Grid */}
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCheck className="h-6 w-6 text-primary" />
                  What's Included
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <FeatureItem icon={<Zap className="h-5 w-5 text-orange-500" />} title="Expert Writers" desc="Qualified professionals with subject-specific expertise." />
                  <FeatureItem icon={<ShieldCheck className="h-5 w-5 text-green-500" />} title="Plagiarism Free" desc="100% original content verified by Turnitin/Copyscape." />
                  <FeatureItem icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />} title="Unlimited Revisions" desc="Free revisions within policy until you are satisfied." />
                  <FeatureItem icon={<Users className="h-5 w-5 text-purple-500" />} title="24/7 Support" desc="Dedicated support team available around the clock." />
                </div>
              </div>

              {/* Ideal Use Case */}
              {service.idealUseCase && (
                <div className="space-y-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
                  <h2 className="text-2xl font-bold">Ideal Use Cases</h2>
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-base">
                      <strong>Perfect for:</strong> {service.idealUseCase}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Process Section */}
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ListTodo className="h-6 w-6 text-primary" />
                  How It Works
                </h2>
                <div className="space-y-4">
                  <ProcessStep step="1" title="Place Order" desc="Select service and provide detailed instructions." />
                  <ProcessStep step="2" title="Expert Match" desc="We assign the best expert for your topic." />
                  <ProcessStep step="3" title="Quality Check" desc="Your work is checked for quality & plagiarism." />
                  <ProcessStep step="4" title="Delivery" desc="Receive your solution before the deadline." />
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
                <h2 className="text-2xl font-bold">Requirements Checklist</h2>
                <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                  <p className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">Please prepare these:</p>
                  <ul className="space-y-3">
                    {['Complete assignment instructions', 'Academic level and word count', 'Deadline requirements', 'Reference materials or files', 'Specific formatting (APA, MLA, etc.)'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground/90">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar */}
            <div className="lg:col-span-1 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="sticky top-6 space-y-6">
                
                {/* Pricing Card */}
                <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
                  <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Starting from</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-muted-foreground">$</span>
                      <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                        {service.price}
                      </span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Final price may vary based on complexity & deadline
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      {service.estimatedTurnaround && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Turnaround</span>
                          <span className="font-medium">{service.estimatedTurnaround}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Policy</span>
                        <span className="font-medium text-green-600">7 Days Revision</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium">Secure & Direct</span>
                      </div>
                    </div>
                    
                    <Separator />

                    <Button asChild className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 group">
                      <Link href={`/request-form?serviceId=${service.id}`}>
                        Proceed with this Service
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground leading-tight">
                      By clicking proceed, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="bg-muted/30 border-0">
                  <CardContent className="p-6 text-center">
                    <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center mx-auto mb-3 border shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <h4 className="font-semibold mb-1">Need Assistance?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unsure about the requirements or have questions?
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

// Sub-components for better readability
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-md group">
      <div className="shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function ProcessStep({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
          {step}
        </div>
        <div className="w-px h-full bg-border my-1 last:hidden" />
      </div>
      <div className="pb-8 last:pb-0">
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}