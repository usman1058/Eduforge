"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

interface Statistics {
  totalUsers: number
  totalRequests: number
  totalPayments: number
  pendingPayments: number
  inProgressRequests: number
  totalDeliverables: number
  openTickets: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatistics() {
      try {
        const response = await fetch("/api/statistics?role=ADMIN")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || "Admin"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of the platform performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.inProgressRequests || 0} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalPayments || 0} payments processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDeliverables || 0}</div>
              <p className="text-xs text-muted-foreground">
                Solutions delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attention Required */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {stats?.pendingPayments || 0}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Awaiting your review and approval
              </p>
              <Button asChild>
                <Link href="/admin/payments">
                  Review Payments <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {stats?.openTickets || 0}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Support tickets requiring attention
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/tickets">
                  View Tickets <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/admin/services">
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Services</div>
                    <div className="text-xs text-muted-foreground">
                      Add, edit, or remove services
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/admin/requests">
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Requests</div>
                    <div className="text-xs text-muted-foreground">
                      View and update requests
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/admin/users">
                  <Users className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-xs text-muted-foreground">
                      View and manage accounts
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Registered Students</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats?.totalRequests || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats?.totalDeliverables || 0}
                </div>
                <div className="text-sm text-muted-foreground">Delivered Solutions</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats?.totalRevenue?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue ($)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
