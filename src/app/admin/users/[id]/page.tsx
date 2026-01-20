"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Search, Mail, Calendar, User, Shield, Ban, CheckCircle2, XCircle, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  role: "STUDENT" | "ADMIN"
  phone?: string
  avatar?: string
  createdAt: string
  isSuspended: boolean
  suspendedAt?: string
  suspendedReason?: string
}

export default function AdminUserDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [suspendData, setSuspendData] = useState({
    reason: "",
    notify: true,
  })

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchUser()
  }, [session, router, params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/users")
          return
        }
        throw new Error("Failed to fetch user")
      }

      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/admin/users")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspend = async () => {
    setUpdating(true)

    try {
      const response = await fetch(`/api/users/${user!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isSuspended: !user!.isSuspended,
          suspendedReason: user!.isSuspended ? undefined : suspendData.reason,
        }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      toast({
        title: user!.isSuspended ? "Account Unsuspended" : "Account Suspended",
        description: `User ${user!.name}'s account has been ${user!.isSuspended ? "restored" : "suspended"}.`,
      })

      setSuspendDialogOpen(false)
      fetchUser()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (!user) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.back()}>
            Back to Users
          </Button>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              {user.name} ({user.email})
            </p>
          </div>
          {user.role === "STUDENT" && (
            <Badge variant="outline">Student</Badge>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="font-medium">{user.name}</div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="font-medium">{user.email}</div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="font-medium">{user.phone || "Not provided"}</div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Account Status</Label>
                {user.isSuspended ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <Ban className="h-4 w-4" />
                    <span className="font-medium">Suspended</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Active</span>
                  </div>
                )}
              </div>

              {user.isSuspended && user.suspendedAt && (
                <div className="space-y-2">
                  <Label>Suspended On</Label>
                  <div className="font-medium">
                    {new Date(user.suspendedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {user.isSuspended && user.suspendedReason && (
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <div className="font-medium text-destructive">{user.suspendedReason}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === "STUDENT" && (
                <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant={user.isSuspended ? "default" : "destructive"}
                      className="w-full"
                    >
                      {user.isSuspended ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Unsuspend Account
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend Account
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {user.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                      </DialogTitle>
                      <DialogDescription>
                        {user.isSuspended
                          ? `Unsuspend ${user.name}'s account? They will regain access to the platform.`
                          : `Suspend ${user.name}'s account? They will lose access to the platform.`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!user.isSuspended && (
                        <div className="space-y-2">
                          <Label htmlFor="suspendReason">Reason for Suspension *</Label>
                          <Textarea
                            id="suspendReason"
                            value={suspendData.reason}
                            onChange={(e) => setSuspendData({ ...suspendData, reason: e.target.value })}
                            placeholder="Explain why this account is being suspended..."
                            rows={4}
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="notify"
                          checked={suspendData.notify}
                          onChange={(e) => setSuspendData({ ...suspendData, notify: e.target.checked })}
                          className="mt-1"
                        />
                        <Label htmlFor="notify" className="text-sm">
                          Notify user via email
                        </Label>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setSuspendDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleToggleSuspend}
                          disabled={updating || (!user.isSuspended && !suspendData.reason.trim())}
                          className="flex-1"
                        >
                          {updating ? "Processing..." : user.isSuspended ? "Unsuspend" : "Suspend"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {user.role === "ADMIN"
                    ? "Admin accounts cannot be suspended. Contact a super admin if needed."
                    : "You can suspend student accounts for violations or suspicious activity."
                  }
                </p>
                <p>
                  Suspended users will not be able to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Log in to their account</li>
                  <li>Access student dashboard</li>
                  <li>Submit new requests</li>
                  <li>Make payments</li>
                  <li>Download deliverables</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
