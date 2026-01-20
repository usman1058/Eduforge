"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Search, Filter, Calendar, Lock, Unlock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface DeliveredRequest {
  id: string
  title: string
  status: string
  deadline: string
  deliveredAt?: string
  service: {
    name: string
  }
  payment: {
    status: string
  }
  _count: {
    deliverables: number
  }
}

export default function StudentDeliverablesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<DeliveredRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchRequests()
  }, [session, router])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/requests?status=DELIVERED`)

      if (!response.ok) throw new Error("Failed to fetch requests")

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching deliverables:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((request) =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const canAccessDeliverables = (paymentStatus: string) => {
    return paymentStatus === "APPROVED"
  }

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
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
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Delivered Solutions</h1>
            <p className="text-muted-foreground">
              Access and download your completed work
            </p>
          </div>
        </div>

        {/* Alert */}
        {requests.some((r) => !canAccessDeliverables(r.payment.status)) && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Some deliverables are locked until your payment is approved. Contact support if you have any questions.
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search delivered solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Deliverables Table */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Work</CardTitle>
            <CardDescription>
              {filteredRequests.length === 0
                ? "No deliverables found"
                : `Showing ${filteredRequests.length} completed request${filteredRequests.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Deliverables Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "You haven't received any completed work yet"
                  }
                </p>
                <Button asChild>
                  <Link href="/quick-apply">Create a Request</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Title</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => {
                      const canAccess = canAccessDeliverables(request.payment.status)
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{request.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {request.service.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(request.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.deliveredAt ? (
                              <span className="text-sm text-green-600 dark:text-green-400">
                                {new Date(request.deliveredAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={canAccess ? "default" : "secondary"}>
                              {request.payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {canAccess ? (
                                <Unlock className="h-4 w-4 text-green-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-semibold">
                                {request._count.deliverables}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              disabled={!canAccess}
                            >
                              <Link href={`/student/requests/${request.id}`}>
                                {canAccess ? (
                                  <>
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-1" />
                                    Locked
                                  </>
                                )}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Supported File Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>• PDF documents</div>
                <div>• Word documents (DOCX)</div>
                <div>• ZIP archives</div>
                <div>• Audio files (MP3, WAV)</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Access Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>• Deliverables require approved payment</div>
                <div>• Download limit per file</div>
                <div>• Files available for 30 days</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="text-muted-foreground">
                  Having trouble accessing your files?
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/student/tickets">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
