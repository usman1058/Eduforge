"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Ticket,
  ArrowRight,
  Plus,
} from "lucide-react"

interface Statistics {
  userRequests: number
  pendingRequests: number
  inProgressRequests: number
  deliveredRequests: number
  userPayments: number
  approvedPayments: number
  pendingPayments: number
  userTickets: number
  openTickets: number
}

interface RecentRequest {
  id: string
  title: string
  status: string
  createdAt: string
  service: {
    name: string
  }
}

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          fetch("/api/statistics"),
          fetch("/api/requests?limit=5"),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json()
          setRecentRequests(requestsData.requests || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CLOSED":
        return "bg-green-500 hover:bg-green-600"
      case "IN_PROGRESS":
        return "bg-blue-500 hover:bg-blue-600"
      case "PAYMENT_APPROVED":
        return "bg-cyan-500 hover:bg-cyan-600"
      case "PAYMENT_REJECTED":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-yellow-500 hover:bg-yellow-600"
    }
  }

  if (isLoading) {
    return (
      <StudentDashboardLayout>
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
          <Skeleton className="h-64 w-full" />
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your academic requests and activities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.userRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.deliveredRequests || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.pendingRequests || 0) + (stats?.inProgressRequests || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingRequests || 0} awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.userPayments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingPayments || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.userTickets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.openTickets || 0} open tickets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="h-auto p-4 justify-start">
                <Link href="/quick-apply">
                  <Plus className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">New Request</div>
                    <div className="text-xs text-muted-foreground">
                      Submit a new academic request
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/student/requests">
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Requests</div>
                    <div className="text-xs text-muted-foreground">
                      Track your existing requests
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/student/deliverables">
                  <CheckCircle className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">My Solutions</div>
                    <div className="text-xs text-muted-foreground">
                      Access delivered solutions
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link href="/student/tickets">
                  <Ticket className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Support</div>
                    <div className="text-xs text-muted-foreground">
                      Get help with your requests
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Your latest academic requests</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/student/requests">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No requests yet. Start by submitting your first request.
                </p>
                <Button asChild>
                  <Link href="/quick-apply">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Request
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium mb-1">{request.title}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{request.service.name}</span>
                        <span>•</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace(/_/g, " ")}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/student/requests/${request.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  )
}
