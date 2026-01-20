"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PublicLayout } from "@/components/layouts/public-layout"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  Github, 
  Twitter, 
  Linkedin,
  Loader2 
} from "lucide-react"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send message")
      }

      toast.success("Message sent successfully! We'll get back to you soon.")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="container max-w-4xl mx-auto py-12 min-h-[calc(100vh-5rem)] flex flex-col items-center">
        
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* TOP SECTION: Contact Info (Centered Grid) */}
        <div className="w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Email Card */}
            <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Email Us</h3>
                <a href="mailto:support@eduforge.com" className="text-sm text-muted-foreground hover:text-primary font-medium break-all">
                  support@eduforge.com
                </a>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Call Us</h3>
                <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-primary font-medium">
                  +1 (555) 123-4567
                </a>
              </CardContent>
            </Card>

            {/* Hours Card */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Support Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Mon-Fri: 9AM - 6PM<br />
                  Email: 24/7
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BOTTOM SECTION: Contact Form (Centered) */}
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Social Links (Optional Footer area) */}
        <div className="flex gap-4 mt-8 animate-in fade-in" style={{ animationDelay: '300ms' }}>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
            <Github className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </PublicLayout>
  )
}