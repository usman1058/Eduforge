"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, FileText, Calendar, DollarSign, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Request {
  id: string
  title: string
  status: string
  deadline: string
  createdAt: string
  service: {
    name: string
  }
  user: {
    name: string
    email: string
  }
  payment?: {
    status: string
  }
  _count: {
    deliverables: number
  }
}

export default function AdminRequestsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchRequests()
  }, [session, router])

  const fetchRequests = async () => {
    try {
      const status = statusFilter !== "all" ? statusFilter : undefined
      const response = await fetch(`/api/requests${status ? `?status=${status}` : ""}`)

      if (!response.ok) throw new Error("Failed to fetch requests")

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      CREATED: { variant: "default", label: "Created" },
      PAYMENT_SUBMITTED: { variant: "secondary", label: "Payment Submitted" },
      PAYMENT_APPROVED: { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Payment Approved" },
      PAYMENT_REJECTED: { variant: "destructive", label: "Payment Rejected" },
      IN_PROGRESS: { variant: "secondary", label: "In Progress" },
      DELIVERED: { variant: "default", className: "bg-blue-500 hover:bg-blue-600", label: "Delivered" },
      CLOSED: { variant: "outline", label: "Closed" },
    }
    const config = variants[status] || variants.CREATED
    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const filteredRequests = requests.filter((request) =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Requests Management</h1>
            <p className="text-muted-foreground">
              Review and manage all academic requests
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="CREATED">Created</SelectItem>
              <SelectItem value="PAYMENT_SUBMITTED">Payment Submitted</SelectItem>
              <SelectItem value="PAYMENT_APPROVED">Payment Approved</SelectItem>
              <SelectItem value="PAYMENT_REJECTED">Payment Rejected</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>
              {filteredRequests.length === 0
                ? "No requests found"
                : `Showing ${filteredRequests.length} request${filteredRequests.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "No requests have been submitted yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{request.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{request.service.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{request.user.name || "-"}</div>
                              <div className="text-xs text-muted-foreground">{request.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(request.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          {request.payment ? (
                            getStatusBadge(request.payment.status)
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/requests/${request.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
