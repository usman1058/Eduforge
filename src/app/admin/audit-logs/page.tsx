"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, History, Clock, User, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  changes?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

const actionColors: Record<string, string> = {
  CREATE_REQUEST: "bg-blue-500",
  SUBMIT_PAYMENT: "bg-green-500",
  UPDATE_REQUEST_STATUS: "bg-yellow-500",
  UPDATE_PAYMENT_STATUS: "bg-orange-500",
  RESOLVE_PAYMENT_DISPUTE: "bg-purple-500",
  CREATE_TICKET: "bg-blue-500",
  UPDATE_TICKET_STATUS: "bg-yellow-500",
  UPLOAD_DELIVERABLE: "bg-green-500",
  SUSPEND_USER: "bg-red-500",
  UNSUSPEND_USER: "bg-green-500",
}

export default function AdminAuditLogsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [entityFilter, setEntityFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchLogs()
  }, [session, router])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs")

      if (!response.ok) throw new Error("Failed to fetch audit logs")

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const bgColor = actionColors[action] || "bg-gray-500"
    return (
      <Badge className={`${bgColor} text-white`}>
        {action.replace(/_/g, " ")}
      </Badge>
    )
  }

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entityId.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((log) => {
    if (entityFilter !== "all" && log.entityType !== entityFilter) return false
    if (actionFilter !== "all" && !log.action.includes(actionFilter)) return false
    return true
  })

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
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track all admin and system actions
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="REQUEST">Requests</SelectItem>
              <SelectItem value="PAYMENT">Payments</SelectItem>
              <SelectItem value="TICKET">Tickets</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
              <SelectItem value="DELIVERABLE">Deliverables</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Creates</SelectItem>
              <SelectItem value="UPDATE">Updates</SelectItem>
              <SelectItem value="SUBMIT">Submissions</SelectItem>
              <SelectItem value="UPLOAD">Uploads</SelectItem>
              <SelectItem value="SUSPEND">Suspensions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              {filteredLogs.length === 0
                ? "No logs found"
                : `Showing ${filteredLogs.length} log entr${filteredLogs.length !== 1 ? "ies" : "y"}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || entityFilter !== "all" || actionFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No activity has been recorded yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{log.entityType}</span>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {log.entityId.slice(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{log.user.name || "-"}</div>
                              <div className="text-xs text-muted-foreground">{log.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {log.ipAddress || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
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
