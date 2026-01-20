"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicLayout } from "@/components/layouts/public-layout"
import { 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Shield, 
  Users, 
  PenTool,
  GraduationCap,
  LayoutList,
  FileEdit,
  BarChart,
  Sparkles,
  Zap,
  CheckCheck,
  Award,
  ChevronRight,
  Star,
  Globe
} from "lucide-react"

// Custom CSS for advanced animations
const customStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  @keyframes float-delayed {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite;
  }
  .text-shimmer {
    background: linear-gradient(110deg, #000000 8%, #444444 18%, #000000 33%);
    background-size: 200% auto;
    color: #000;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
  .dark .text-shimmer {
    background: linear-gradient(110deg, #fff 8%, #e0e0e0 18%, #fff 33%);
    background-size: 200% auto;
    -webkit-text-fill-color: transparent;
  }
`

const servicesData = [
  { title: "Essay Writing", desc: "Professional essays for all academic levels", icon: PenTool, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Research Papers", desc: "Complete research support and writing", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Dissertation Help", desc: "Thesis and dissertation assistance", icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-100" },
  { title: "Assignment Help", desc: "Homework and project assistance", icon: LayoutList, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Editing & Proofreading", desc: "Professional editing services", icon: FileEdit, color: "text-green-600", bg: "bg-green-100" },
  { title: "Data Analysis", desc: "Statistical analysis and reporting", icon: BarChart, color: "text-indigo-600", bg: "bg-indigo-100" },
]

export default function HomePage() {
  return (
    <>
      <style>{customStyles}</style>
      <PublicLayout>
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 md:pt-24 pb-20">
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-float-delayed" />

          <div className="container grid lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-up">
              <Badge variant="secondary" className="w-fit px-4 py-1 rounded-full font-medium">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                Trusted by 10k+ Students
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Professional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary bg-300% animate-[shimmer_3s_linear_infinite]">
                  Academic Assistance
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Expert help for essays, research papers, dissertations, and more. 
                <span className="text-foreground font-semibold">Get quality academic support tailored to your needs.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all" asChild>
                  <Link href="/quick-apply">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 hover:bg-muted" asChild>
                  <Link href="/services">Explore Services</Link>
                </Button>
              </div>
            </div>

            {/* Right: Floating Illustration */}
            <div className="hidden lg:block relative h-[500px] w-full">
              {/* Main Card Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-gradient-to-br from-primary to-blue-600 rounded-3xl shadow-2xl shadow-primary/40 rotate-6 animate-float z-20 flex items-center justify-center">
                <div className="text-white">
                   <GraduationCap className="h-32 w-32 drop-shadow-xl" />
                </div>
              </div>

              {/* Floating Small Elements */}
              <div className="absolute top-10 right-20 bg-background p-4 rounded-2xl shadow-xl border-2 border-border/50 animate-float-delayed z-30">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>

              <div className="absolute bottom-20 left-10 bg-background p-4 rounded-2xl shadow-xl border-2 border-border/50 animate-float z-30">
                <Award className="h-10 w-10 text-yellow-500" />
              </div>

              <div className="absolute top-32 left-20 bg-background p-4 rounded-2xl shadow-xl border-2 border-border/50 animate-float-delayed z-30">
                <FileEdit className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16 space-y-4 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose Eduforge?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide top-quality academic assistance with a focus on excellence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <BookOpen className="h-8 w-8 text-blue-600" />, title: "Expert Writers", desc: "Advanced degrees in various fields." },
                { icon: <Zap className="h-8 w-8 text-yellow-600" />, title: "Fast Delivery", desc: "Meet tight deadlines without compromise." },
                { icon: <Shield className="h-8 w-8 text-green-600" />, title: "Confidential", desc: "Your privacy is our top priority." },
                { icon: <Users className="h-8 w-8 text-purple-600" />, title: "24/7 Support", desc: "Available around the clock." },
              ].map((feature, i) => (
                <div key={i} className="group perspective-1000 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <Card className="h-full border-none shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-8 text-center">
                      <div className="mb-6 w-16 h-16 rounded-2xl bg-background mx-auto flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (Horizontal Timeline) */}
        <section className="py-24">
          <div className="container">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Your academic journey in 4 simple steps</p>
            </div>

            <div className="relative max-w-5xl mx-auto animate-fade-up">
              {/* Timeline Line */}
              <div className="absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-muted to-transparent hidden md:block" />
              <div className="absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block" />

              <div className="grid md:grid-cols-4 gap-8 relative">
                {steps.map((step, i) => (
                  <div key={i} className="text-center relative z-10 group cursor-default">
                    <div className="mb-6 mx-auto relative">
                      <div className="w-20 h-20 rounded-full bg-background border-4 border-muted group-hover:border-primary transition-all duration-500 flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:text-primary shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/quick-apply">Start Your Request <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* SERVICES PREVIEW */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 animate-fade-up">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Services</h2>
                <p className="text-lg text-muted-foreground">Comprehensive academic assistance</p>
              </div>
              <Button size="lg" variant="outline" className="hover:bg-background" asChild>
                <Link href="/services">View All <ChevronRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.map((service, i) => (
                <Card 
                  key={i} 
                  className="group relative overflow-hidden border-none bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Hover Background Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${service.bg}`} />
                  
                  <CardHeader className="relative z-10 pb-2">
                    <div className={`h-14 w-14 rounded-xl ${service.bg} ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <service.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-foreground transition-colors">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <CardDescription className="text-base leading-relaxed mb-6">{service.desc}</CardDescription>
                    <div className="flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3dpZHM9IjEwIDAgMjAgMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gcmVzdWx0PSIuMCIgd2lkdGg9IjAuMCIvPjwvZGVmcz48L3N2Zz4=')] opacity-10" />
          
          <div className="container text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">
              Ready to Succeed?
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90 mb-10 font-light">
              Join thousands of students who trust Eduforge for their academic success
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Button size="lg" variant="secondary" className="w-full h-14 text-lg shadow-xl hover:-translate-y-1 transition-all" asChild>
                <Link href="/quick-apply">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full h-14 text-lg border-white/50 hover:bg-white/10 text-white" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST INDICATORS (Glass Cards) */}
        <section className="py-20 border-t border-border/50">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-6 animate-fade-up">
              {[
                { value: "10K+", label: "Satisfied Students", icon: <Users className="h-6 w-6" /> },
                { value: "98%", label: "Success Rate", icon: <CheckCheck className="h-6 w-6" /> },
                { value: "50+", label: "Expert Writers", icon: <Sparkles className="h-6 w-6" /> },
                { value: "24/7", label: "Support Available", icon: <Clock className="h-6 w-6" /> },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center group hover:bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-center gap-2 mb-3 text-primary group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </PublicLayout>
    </>
  )
}

const steps = [
  { title: "Select Service", desc: "Choose from our range of academic services", icon: <LayoutList className="h-8 w-8" /> },
  { title: "Fill Request", desc: "Provide your requirements and upload files", icon: <FileEdit className="h-8 w-8" /> },
  { title: "Make Payment", desc: "Complete payment and receive confirmation", icon: <CheckCircle2 className="h-8 w-8" /> },
  { title: "Get Results", desc: "Access your dashboard and download solutions", icon: <Award className="h-8 w-8" /> },
]