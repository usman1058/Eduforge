"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, ArrowRight, ArrowLeft, FileText, LayoutTemplate, PenTool, Globe, Clock, Zap, Loader2 } from "lucide-react" // Added Loader2


interface Service {
  id: string
  name: string
  slug: string
  description: string
  estimatedTurnaround: string | null
  pricingNote: string
}

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

const getServiceIcon = (slug: string) => {
  const lowerSlug = slug.toLowerCase()
  if (lowerSlug.includes('essay')) return PenTool
  if (lowerSlug.includes('paper')) return FileText
  if (lowerSlug.includes('web')) return Globe
  return LayoutTemplate
}

function QuickApplyContent({ serviceId }: { serviceId: string | null }) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>(serviceId || "")
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false) // New state for button loading

  useEffect(() => {
    async function fetchServices() {
      try {
        // Simulating delay for smooth animation entry
        await new Promise(r => setTimeout(r, 400))
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

  const handleContinue = async () => {
    if (selectedService && !isNavigating) {
      setIsNavigating(true)
      await router.push(`/request-form?serviceId=${selectedService}`)
    }
  }

  return (
    <div className="container py-12 min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 w-fit group">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Hero Section */}
      <div className="text-center mb-16 space-y-2 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Apply</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Select a service to begin. Complete your request in 4 simple steps.
        </p>
      </div>

      {/* IMPROVED STEPPER */}
      <div className="max-w-5xl mx-auto w-full mb-20 animate-fade-up">
        <div className="relative">
          {/* Base Line */}
          <div className="absolute top-6 left-0 w-full h-[2px] bg-muted rounded-full" />

          {/* Progress Line (Step 1 active → 25%) */}
          <div
            className="absolute top-6 left-0 h-[2px] rounded-full
      bg-gradient-to-r from-primary via-blue-600 to-primary
      transition-all duration-700 ease-out"
            style={{ width: "25%" }}
          />

          <div className="relative grid grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const isActive = index === 0
              const isCompleted = index < 0
              const isUpcoming = index > 0

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
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-muted text-muted-foreground group-hover:border-primary/40"
                      }
              `}
                  >
                    {isActive ? (
                      <Zap className="h-5 w-5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold text-sm">{step.number}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-4 space-y-1">
                    <p
                      className={`text-sm font-semibold transition-colors
                  ${isActive
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


      {/* REDESIGNED SERVICES GRID */}
      <div className="max-w-5xl mx-auto w-full flex-1 animate-fade-up" style={{ animationDelay: '400ms' }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Choose a Service</h2>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Available 24/7
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const isSelected = selectedService === service.id
              const Icon = getServiceIcon(service.slug)

              return (
                <div
                  key={service.id}
                  onClick={() => !isNavigating && setSelectedService(service.id)} // Prevent selection while navigating
                  className={`
                    relative p-5 rounded-xl border transition-all duration-300 ease-out cursor-pointer
                    flex items-start gap-4 group overflow-hidden
                    ${isNavigating ? "opacity-50 cursor-not-allowed" : ""} 
                    ${isSelected
                      ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/30/50 hover:-translate-y-0.5"
                    }
                  `}
                >
                  {/* Selection Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/50'}`} />

                  {/* Icon */}
                  <div className={`
                    h-12 w-12 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80'}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold text-lg leading-tight ${isSelected ? 'text-primary' : ''}`}>
                        {service.name}
                      </h3>
                      {isSelected && (
                        <div className="shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      {service.estimatedTurnaround && (
                        <Badge variant="secondary" className="text-xs font-normal py-0.5 px-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.estimatedTurnaround}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-medium">
                        {service.pricingNote}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border p-4 z-50 animate-slide-up md:relative md:bg-transparent md:border-none md:p-8 md:mt-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selected Service</p>
                <p className="text-base font-bold">
                  {services.find(s => s.id === selectedService)?.name}
                </p>
              </div>
            </div>
            
            {/* Updated Button with Loading State */}
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={isNavigating}
              className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-80"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Step 2
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuickApplyPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="container py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <QuickApplySuspense />
      </Suspense>
    </PublicLayout>
  )
}

function QuickApplySuspense() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")
  return <QuickApplyContent serviceId={serviceId} />
}