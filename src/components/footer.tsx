"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react"



export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-secondary/30 relative overflow-hidden">
      {/* Background Decoration (Optional Mesh Gradient effect) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/50 pointer-events-none" />

      <div className="container relative py-12 md:py-16 px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4 footer-animate" style={{ animationDelay: '0ms' }}>
            <Link href="/" className="inline-flex items-center space-x-2 font-bold text-2xl tracking-tight group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <span className="text-lg">E</span>
              </div>
              <span className="text-foreground">duforge</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering students worldwide with professional academic assistance, ensuring quality, reliability, and success.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-animate" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/services" label="Our Services" />
              <FooterLink href="/quick-apply" label="Quick Apply" />
              <FooterLink href="/about" label="About Us" />
              <FooterLink href="/contact" label="Contact Support" />
            </ul>
          </div>

          {/* Services */}
          <div className="footer-animate" style={{ animationDelay: '200ms' }}>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Services
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/services" label="Essay Writing" />
              <FooterLink href="/services" label="Research Papers" />
              <FooterLink href="/services" label="Dissertation Help" />
              <FooterLink href="/services" label="Editing & Proofreading" />
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-animate" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <div className="bg-muted/50 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Us</p>
                  <a href="mailto:support@eduforge.com" className="hover:text-primary transition-colors">support@eduforge.com</a>
                </div>
              </li>
              
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <div className="bg-muted/50 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Call Us</p>
                  <a href="tel:+15551234567" className="hover:text-primary transition-colors">+1 (555) 123-4567</a>
                </div>
              </li>

              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <div className="bg-muted/50 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Visit Us</p>
                  <p>123 Academic Street,<br/>Education City, EC 12345</p>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            &copy; {currentYear} Eduforge. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-medium">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Sub-component for Footer Links to reduce code clutter
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
      >
        <span className="w-0 h-[1px] bg-primary group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2 opacity-0 group-hover:opacity-100"></span>
        {label}
      </Link>
    </li>
  )
}

// Sub-component for Social Icons
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      aria-label={label}
      className="h-9 w-9 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm"
    >
      {icon}
    </Link>
  )
}