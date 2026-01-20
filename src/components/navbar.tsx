"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface NavbarProps {
  showAuthLinks?: boolean
}

export function Navbar({ showAuthLinks = true }: NavbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // useEffect to handle theme hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const isPublicPage =
    !pathname.startsWith("/student") && !pathname.startsWith("/admin")
  const isStudentPage = pathname.startsWith("/student")
  const isAdminPage = pathname.startsWith("/admin")

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const NavLink = ({
    href,
    label,
  }: {
    href: string
    label: string
  }) => (
    <Link
      href={href}
      className={`group relative text-sm font-medium transition-colors duration-200
        ${
          isActive(href)
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {label}
      <span
        className={`absolute -bottom-[22px] left-0 h-[2px] w-full bg-primary transition-transform duration-300 ease-out origin-center
          ${isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
      />
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo with subtle hover animation */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-bold text-xl tracking-tight transition-transform active:scale-95"
        >
          <div className="relative flex items-center justify-center rounded-lg bg-primary/10 p-1 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
            Eduforge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isPublicPage && (
            <>
              <NavLink href="/services" label="Services" />
              <NavLink href="/quick-apply" label="Quick Apply" />
              <NavLink href="/about" label="About" />
              <NavLink href="/custom-quote" label="Custom Order" />
              <NavLink href="/contact" label="Contact" />
            </>
          )}

          {isStudentPage && (
            <>
              <NavLink href="/student/dashboard" label="Dashboard" />
              <NavLink href="/student/requests" label="Requests" />
              <NavLink href="/student/payments" label="Payments" />
              <NavLink href="/student/deliverables" label="Solutions" />
              <NavLink href="/student/tickets" label="Support" />
            </>
          )}

          {isAdminPage && (
            <>
              <NavLink href="/admin/dashboard" label="Dashboard" />
              <NavLink href="/admin/services" label="Services" />
              <NavLink href="/admin/requests" label="Requests" />
              <NavLink href="/admin/payments" label="Payments" />
              <NavLink href="/admin/users" label="Users" />
              <NavLink href="/admin/settings" label="Settings" />
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted transition-transform active:scale-90"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Auth */}
          {showAuthLinks && (
            <>
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 px-3 h-9 hover:bg-muted/50 data-[state=open]:bg-muted"
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <User className="h-4 w-4" />
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      <span className="hidden lg:inline-block text-sm font-medium">
                        {session.user.name?.split(' ')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-1">
                          {session.user.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          session.user.role === "ADMIN"
                            ? "/admin/dashboard"
                            : "/student/dashboard"
                        }
                        className="flex items-center cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          session.user.role === "ADMIN"
                            ? "/admin/profile"
                            : "/student/profile"
                        }
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50/50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" asChild className="h-9 font-medium">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild className="h-9 font-medium shadow-lg shadow-primary/20 transition-transform active:scale-95">
                    <Link href="/quick-apply">Get Started</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Animation */}
      <div
        className={`md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/40 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-4">
            {isPublicPage && (
              <>
                <MobileNavLink href="/services" label="Services" />
                <MobileNavLink href="/quick-apply" label="Quick Apply" />
                <MobileNavLink href="/about" label="About" />
                <MobileNavLink href="/custom-quote" label="Custom Order" />
                <MobileNavLink href="/contact" label="Contact" />
              </>
            )}

            {isStudentPage && (
              <>
                <MobileNavLink href="/student/dashboard" label="Dashboard" />
                <MobileNavLink href="/student/requests" label="Requests" />
                <MobileNavLink href="/student/payments" label="Payments" />
                <MobileNavLink href="/student/deliverables" label="Solutions" />
                <MobileNavLink href="/student/tickets" label="Support" />
              </>
            )}
            
             {isAdminPage && (
              <>
                <MobileNavLink href="/admin/dashboard" label="Dashboard" />
                <MobileNavLink href="/admin/services" label="Services" />
                <MobileNavLink href="/admin/requests" label="Requests" />
                <MobileNavLink href="/admin/users" label="Users" />
              </>
            )}
          </div>

          {!session && (
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full h-11">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="w-full h-11 shadow-lg shadow-primary/10">
                <Link href="/quick-apply">Get Started</Link>
              </Button>
            </div>
          )}

          {session && (
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full h-11 justify-start">
                <Link
                  href={
                    session.user.role === "ADMIN"
                      ? "/admin/dashboard"
                      : "/student/dashboard"
                  }
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full h-11 justify-start text-red-500 hover:text-red-600 hover:bg-red-50/50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Helper for Mobile Nav Links to save indentation
function MobileNavLink({ href, label }: { href: string, label: string }) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + "/")
    
    return (
        <Link
            href={href}
            className={`text-base font-medium transition-colors py-2 block ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
            {label}
        </Link>
    )
}