"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, FileText, Calendar, Plus, ArrowRight } from "lucide-react"

interface Request {
  id: string
  title: string
  status: string
  createdAt: string
  deadline: string
  service: {
    name: string
  }
  payment?: {
    status: string
  }
  _count: {
    files: number
    deliverables: number
  }
}

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true)
        const url = statusFilter === "all"
          ? "/api/requests"
          : `/api/requests?status=${statusFilter}`

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests || [])
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [statusFilter])

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CLOSED":
        return "default"
      case "IN_PROGRESS":
        return "secondary"
      case "PAYMENT_APPROVED":
        return "outline"
      case "PAYMENT_REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CLOSED":
        return "✓"
      case "IN_PROGRESS":
        return "⚙"
      case "PAYMENT_APPROVED":
        return "✓"
      case "PAYMENT_REJECTED":
        return "✗"
      default:
        return "⏳"
    }
  }

  return (
    <StudentDashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="text-muted-foreground">
              Manage and track your academic requests
            </p>
          </div>
          <Button asChild>
            <Link href="/quick-apply">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="PAYMENT_SUBMITTED">Payment Submitted</SelectItem>
                  <SelectItem value="PAYMENT_APPROVED">Payment Approved</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-96 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "No requests found" : "No requests yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by submitting your first academic request"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/quick-apply">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Request
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.service.name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)} {request.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                        </div>
                        {request._count.files > 0 && (
                          <span>
                            <FileText className="h-4 w-4 inline mr-1" />
                            {request._count.files} files
                          </span>
                        )}
                        {request._count.deliverables > 0 && (
                          <span>
                            ✓ {request._count.deliverables} deliverables
                          </span>
                        )}
                      </div>

                      {request.payment && (
                        <Badge variant="outline" className="w-fit">
                          Payment: {request.payment.status.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>

                    <Button asChild>
                      <Link href={`/student/requests/${request.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
