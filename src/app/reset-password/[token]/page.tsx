"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CheckCircle2, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { PublicLayout } from "@/components/layouts/public-layout"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get("token") || ""

  useEffect(() => {
    if (token) {
      validateToken(token)
    }
  }, [token])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/validate-reset-token?token=${resetToken}`)

      if (!response.ok) {
        setTokenValid(false)
        setError("Invalid or expired reset token")
      } else {
        setTokenValid(true)
        setError(null)
      }
    } catch (err) {
      setTokenValid(false)
      setError("Failed to validate token")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error("Please enter your new password")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reset password")
      }

      toast.success("Password has been reset successfully!")
      setSuccess(true)
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to reset password")
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] py-12">
          <Skeleton className="h-96 w-full max-w-md" />
        </div>
      </PublicLayout>
    )
  }

  if (tokenValid === false) {
    return (
      <PublicLayout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Invalid Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {error || "The password reset link is invalid or has expired."}
              </p>
              <p className="text-sm text-muted-foreground">
                Please request a new password reset link.
              </p>
              <Button asChild className="w-full mt-4" variant="outline">
                <a href="/forgot-password">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Request New Reset
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  if (success) {
    return (
      <PublicLayout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Password Reset Successful</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>
              <Button asChild className="w-full" onClick={() => router.push("/login")}>
                <Link href="/login">
                  Go to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px-200px)] py-12">
        <Button variant="ghost" size="icon" asChild onClick={() => router.back()}>
          <a href="/login">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter new password"
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Confirm new password"
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <a href="/login" className="text-primary hover:underline">
                    Login
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
