import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicLayout } from "@/components/layouts/public-layout"
import { ArrowLeft, Target, ShieldCheck, Users, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl font-bold">About Eduforge</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering students worldwide with professional academic assistance since 2020
          </p>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Eduforge was founded with a simple yet powerful mission: to provide students with access to
                high-quality academic assistance that helps them achieve their educational goals. We understand
                the challenges students face in today's competitive academic environment, and we're committed to
                being a trusted partner in their success journey.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Over the years, we've grown from a small team of passionate educators to a comprehensive platform
                serving students from over 50 countries. Our commitment to quality, integrity, and customer
                satisfaction has earned us the trust of thousands of students worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Values</h2>
            <p className="text-muted-foreground mt-2">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We strive for excellence in everything we do, from the quality of our work to the level of service we provide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We uphold the highest standards of academic integrity and ethical practices in all our services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Student Success</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our success is measured by the success of our students. We're dedicated to helping them achieve their goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We never compromise on quality. Every piece of work we deliver meets the highest standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Team</h2>
            <p className="text-muted-foreground mt-2">
              Meet the experts behind Eduforge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold">JD</span>
                </div>
                <h3 className="text-lg font-semibold text-center">Dr. Jane Doe</h3>
                <p className="text-sm text-muted-foreground text-center mb-2">Founder & CEO</p>
                <p className="text-xs text-muted-foreground text-center">
                  PhD in Education with 15+ years of academic experience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold">MS</span>
                </div>
                <h3 className="text-lg font-semibold text-center">Michael Smith</h3>
                <p className="text-sm text-muted-foreground text-center mb-2">Head of Academic Services</p>
                <p className="text-xs text-muted-foreground text-center">
                  MA in English Literature with expertise in academic writing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold">SJ</span>
                </div>
                <h3 className="text-lg font-semibold text-center">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground text-center mb-2">Customer Success Manager</p>
                <p className="text-xs text-muted-foreground text-center">
                  MBA with 10+ years of customer service experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Academic Integrity */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Academic Integrity</CardTitle>
              <CardDescription>
                Our commitment to ethical practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                At Eduforge, we take academic integrity seriously. Our services are designed to assist and
                guide students in their academic journey, not to replace their own learning efforts. We:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Provide original, plagiarism-free content</li>
                <li>Encourage students to use our work as reference material</li>
                <li>Maintain strict confidentiality of all client information</li>
                <li>Adhere to ethical guidelines and academic standards</li>
                <li>Never encourage academic dishonesty or misconduct</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                We believe that proper use of our services can help students learn and improve their own academic
                skills, leading to better understanding and success in their studies.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of students who trust Eduforge for their academic success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/quick-apply">
                Get Started Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
