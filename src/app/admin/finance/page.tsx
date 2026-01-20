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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, DollarSign, Calendar, Eye, CheckCircle2, XCircle, AlertCircle, TrendingUp, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  referenceNumber: string
  amount: number
  currency: string
  receiptUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW"
  rejectionReason?: string
  fraudFlagged?: boolean
  fraudNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: "STUDENT" | "ADMIN"
  }
  request: {
    id: string
    title: string
    status: string
    service: {
      name: string
    }
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  PKR: "₨",
  JPY: "¥",
  CNY: "¥",
}

export default function AdminFinancePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW">("all")

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchPayments()
  }, [session, router, selectedStatusFilter, page])

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({
        viewAll: "true",
        status: selectedStatusFilter === "all" ? "" : selectedStatusFilter,
        page: page.toString(),
        limit: "20",
      })

      const response = await fetch(`/api/payments?${params}`)

      if (!response.ok) throw new Error("Failed to fetch payments")

      const data = await response.json()
      setPayments(data.payments || [])
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { variant: "default", label: "Pending" },
      APPROVED: { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      UNDER_REVIEW: { variant: "secondary", label: "Under Review" },
    }
    const config = variants[status] || variants.PENDING
    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getCurrencySymbol = (currencyCode: string) => {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode || "$"
  }

  const calculateTotalUSD = (payments: Payment[]) => {
    let totalUSD = 0

    payments.forEach(payment => {
      let amountInUSD = payment.amount

      // Simple conversion rates (you can move these to constants or API)
      const conversionRates: Record<string, number> = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.36,
        AUD: 1.53,
        INR: 83.12,
        PKR: 277.80,
        JPY: 149.50,
        CNY: 7.24,
      }

      const rate = conversionRates[payment.currency] || 1

      // If not USD, convert to USD
      if (payment.currency !== "USD") {
        amountInUSD = payment.amount / rate
      }

      totalUSD += amountInUSD
    })

    return totalUSD
  }

  const totalUSD = calculateTotalUSD(payments)

  const filteredPayments = payments.filter((payment) =>
    payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.request.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = getCurrencySymbol(currency)
    return `${symbol} ${amount.toFixed(2)} ${currency}`
  }

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Finance & Payments</h1>
            <p className="text-muted-foreground">
              View all payment transactions across the platform
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter((p) => p.status === "APPROVED").length} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalUSD.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Converted from all currencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter((p) => p.status === "PENDING").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter((p) => p.status === "REJECTED").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, name, email, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatusFilter} onValueChange={(value: any) => {
            setSelectedStatusFilter(value)
            setPage(1)
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payment Transactions</CardTitle>
            <CardDescription>
              {filteredPayments.length === 0
                ? "No payments found"
                : `Showing ${filteredPayments.length} transaction${filteredPayments.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No payments match your search"
                    : "No payment transactions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.user.name}</div>
                            <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.request.title}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(payment.receiptUrl, "_blank")}
                            title="View receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/payments/${payment.id}`)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
