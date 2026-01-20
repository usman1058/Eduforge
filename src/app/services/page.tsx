"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Clock, 
  DollarSign, 
  ArrowRight, 
  FileText, 
  PenTool, 
  Code2, 
  GraduationCap, 
  FileEdit, 
  Sparkles, 
  Target 
} from "lucide-react"

interface Service {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  idealUseCase: string
  estimatedTurnaround: string
  pricingNote: string
  isActive: boolean
}

// Helper to assign icons based on service name
const getServiceIcon = (slug: string) => {
  const lowerSlug = slug.toLowerCase()
  if (lowerSlug.includes('essay')) return PenTool
  if (lowerSlug.includes('paper') || lowerSlug.includes('research')) return FileText
  if (lowerSlug.includes('web') || lowerSlug.includes('programming') || lowerSlug.includes('coding')) return Code2
  if (lowerSlug.includes('dissertation') || lowerSlug.includes('thesis')) return GraduationCap
  if (lowerSlug.includes('edit') || lowerSlug.includes('proofread') || lowerSlug.includes('review')) return FileEdit
  return Sparkles
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        // Simulate slight delay for smooth entry
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

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 min-h-[calc(100vh-5rem)]">
          <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Skeleton className="h-10 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="h-px bg-border w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (services.length === 0) {
    return (
      <PublicLayout>
        <div className="container py-12 text-center space-y-4">
          <h1 className="text-4xl font-bold">No Services Found</h1>
          <p className="text-xl text-muted-foreground">
            Please check back later.
          </p>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="container py-12 min-h-[calc(100vh-5rem)]">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Comprehensive academic solutions tailored to meet your educational goals with professional expertise.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = getServiceIcon(service.slug)
            
            return (
              <Card 
                key={service.id} 
                className="group h-full flex flex-col border-border/40 bg-card/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Top Gradient Decoration (Subtle) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    {/* Icon Box */}
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    {/* Pricing Badge (Top Right) */}
                    {service.pricingNote && (
                      <Badge variant="secondary" className="text-xs font-normal bg-muted/50">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {service.pricingNote}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Ideal Use Case Section */}
                  {service.idealUseCase && (
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Ideal For
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.idealUseCase}
                      </p>
                    </div>
                  )}

                  {/* Turnaround Badge */}
                  {service.estimatedTurnaround && (
                    <Badge variant="outline" className="w-fit gap-1.5 border-dashed text-foreground/80">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{service.estimatedTurnaround}</span>
                    </Badge>
                  )}
                </CardContent>

                <CardFooter className="pt-4 mt-auto border-t border-border/40 gap-3">
                  <Button asChild className="flex-1 group/btn">
                    <Link href={`/request-form?serviceId=${service.id}`}>
                      Select Service
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="px-3 hover:bg-muted">
                    <Link href={`/services/${service.slug}`} aria-label={`View details for ${service.name}`}>
                      <ArrowRight className="h-4 w-4 rotate-[-45deg]" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </PublicLayout>
  )
}