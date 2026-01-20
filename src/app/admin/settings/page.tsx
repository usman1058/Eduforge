"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Save, CreditCard, FileText, Shield, Bell, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Setting {
  key: string
  value: string
  category: string
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    platformName: "",
    paymentInstructions: "",
    maxFileSize: "",
    allowedFileTypes: "",
  })

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchSettings()
  }, [session, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")

      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = await response.json()

      const settingsMap = data.settings.reduce((acc: Record<string, string>, s: Setting) => {
        acc[s.key] = s.value
        return acc
      }, {})

      setFormData({
        platformName: settingsMap.platform_name || "Eduforge",
        paymentInstructions: settingsMap.payment_instructions || "",
        maxFileSize: settingsMap.max_file_size_mb || "10",
        allowedFileTypes: settingsMap.allowed_file_types || "pdf,doc,docx,zip,mp3,wav",
      })

      setSettings(data.settings || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      const updates = [
        { key: "platform_name", value: formData.platformName, category: "general" },
        { key: "payment_instructions", value: formData.paymentInstructions, category: "payment" },
        { key: "max_file_size_mb", value: formData.maxFileSize, category: "files" },
        { key: "allowed_file_types", value: formData.allowedFileTypes, category: "files" },
      ]

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: updates }),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform-wide settings
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={formData.platformName}
                  onChange={(e) =>
                    setFormData({ ...formData, platformName: e.target.value })
                  }
                  placeholder="Eduforge"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  value={formData.paymentInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentInstructions: e.target.value })
                  }
                  rows={8}
                  placeholder="Enter payment instructions that will be shown to users..."
                />
                <p className="text-xs text-muted-foreground">
                  These instructions will be displayed to users on the payment page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={formData.maxFileSize}
                  onChange={(e) =>
                    setFormData({ ...formData, maxFileSize: e.target.value })
                  }
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={formData.allowedFileTypes}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedFileTypes: e.target.value })
                  }
                  placeholder="pdf,doc,docx,zip,mp3,wav"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of allowed file extensions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Email notifications for payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Email notifications for deliverables</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Admin alerts for disputes</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Notification settings are currently managed through the system configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
