"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading("credentials")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Login successful!")
        // Redirect based on role
        const session = await fetch("/api/auth/session").then(r => r.json())
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard")
        } else {
          router.push("/student/dashboard")
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider)
    // Let NextAuth handle the redirect
    window.location.href = `/api/auth/signin/${provider}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading !== null}
              >
                {isLoading === "google" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.21 3.31v2.77h3.57c2.08-1.04 2.21-3.31 4.2V7.07h3.57c-1.04 2.08-1.04 2.21-3.31 4.2-5.09-2.79-2.66-2.9-3.61-4.13-1.76-1.74-1.53-1.12-2.79-3.51z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.04.5.04-5.04s-5.04 5.04c0 2.97 0 5.04 5.04-5.04 5.04 5.04c2.08 1.53.32-2.09 2.28-5.13-5.13s-5.13 5.13 5.13 5.13c2.86 0-5.93-5.93-5.93-5.93-2.14-1.86-2.86-2.86-2.86-2.86-2.86-2.86-2.93z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09 2.09-2.09 2.09-3.31-2.79-2.21-2.62-.66-.35-2.09.26-1.93-2.66-2.62-2.86-2.93l1.36-2.86-2.09-2.09-2.09-3.31-2.09-2.62-.35-.35-2.09.26-1.93-2.66-2.62-2.86-2.93z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09 2.09-2.09 2.09-3.31-2.79-2.21-2.62-.66-.35-2.09.26-1.93-2.66-2.62-2.86-2.93z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading !== null}
              >
                {isLoading === "github" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Github className="h-4 w-4 mr-2" />
                )}
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <p className="relative text-center text-sm text-muted-foreground bg-background px-2">
                Or continue with email
              </p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading !== null}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading !== null}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading !== null}>
                {isLoading === "credentials" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/quick-apply" className="text-primary hover:underline font-medium">
                  Get started
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
