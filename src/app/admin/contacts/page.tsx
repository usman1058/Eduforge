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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Mail, CheckCircle2, XCircle, AlertCircle, Reply, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Contact {
  updatedAt: string | number | Date
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "PENDING" | "RESPONDED" | "ARCHIVED"
  response?: string
  createdAt: string
  admin: {
    id: string
    name: string
    email: string
  }
}

export default function AdminContactsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [responding, setResponding] = useState(false)
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [responseData, setResponseData] = useState({ status: "", response: "" })

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized")
      return
    }

    fetchContacts()
  }, [session, router, statusFilter, page])

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter === "all" ? "" : statusFilter,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/contacts?${params}`)

      if (!response.ok) throw new Error("Failed to fetch contacts")

      const data = await response.json()
      setContacts(data.contacts || [])
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (contactId: string, newStatus: string, responseText?: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          response: responseText || "",
        }),
      })

      if (!response.ok) throw new Error("Failed to update contact")

      toast({
        title: "Contact Updated",
        description: `Contact has been ${newStatus.toLowerCase()}.`,
      })

      setResponseDialogOpen(false)
      fetchContacts()
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact submission?")) return

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete contact")

      toast({
        title: "Contact Deleted",
        description: "Contact submission has been deleted successfully.",
      })

      fetchContacts()
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openResponseDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setResponseData({
      status: contact.status,
      response: contact.response || "",
    })
    setResponseDialogOpen(true)
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default" as const, label: "Pending" },
      RESPONDED: { variant: "default" as const, className: "bg-green-500 hover:bg-green-600", label: "Responded" },
      ARCHIVED: { variant: "secondary" as const, label: "Archived" },
    }
    const config = variants[status as keyof typeof variants] || variants.PENDING
    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    )
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
            <h1 className="text-3xl font-bold">Contact Submissions</h1>
            <p className="text-muted-foreground">
              Manage contact form submissions from users
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {total} Total
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESPONDED">Responded</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              {filteredContacts.length === 0
                ? "No contacts found"
                : `Showing ${filteredContacts.length} submission${filteredContacts.length !== 1 ? "s" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submissions</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No contacts match your search"
                    : "No contact submissions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responded By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(contact.createdAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="text-sm">{contact.email}</TableCell>
                        <TableCell className="font-medium">{contact.subject}</TableCell>
                        <TableCell className="text-sm max-w-xs">
                          <div className="truncate" title={contact.message}>
                            {contact.message.substring(0, 100)}
                            {contact.message.length > 100 && "..."}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell className="text-sm">
                          {contact.admin ? (
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">{contact.admin.name}</div>
                                <div className="text-muted-foreground">{contact.admin.email}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">Admin</Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResponseDialog(contact)}
                              title={contact.response ? "View response" : "Respond"}
                            >
                              {contact.response ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <Reply className="h-4 w-4" />
                              )}
                            </Button>
                            {contact.status !== "ARCHIVED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(contact.id, "ARCHIVED")}
                                title="Archive"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contact.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
        {total > 10 && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 10)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedContact?.response ? "View Response" : "Respond to Contact"}
            </DialogTitle>
            <DialogDescription>
              {selectedContact?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              {/* Original Message */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm font-medium">From:</span>
                  <span className="ml-2">{selectedContact.name} ({selectedContact.email})</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Message:</span>
                  <p className="mt-1 text-sm">{selectedContact.message}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </div>
              </div>

              {!selectedContact.response ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="status">Update Status</Label>
                    <Select
                      value={responseData.status}
                      onValueChange={(value) => setResponseData({ ...responseData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="RESPONDED">Responded</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response">Admin Response</Label>
                    <Textarea
                      id="response"
                      rows={6}
                      placeholder="Type your response to this contact submission..."
                      value={responseData.response}
                      onChange={(e) => setResponseData({ ...responseData, response: e.target.value })}
                      required={responseData.status === "RESPONDED"}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setResponseDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(selectedContact.id, responseData.status, responseData.response)}
                      disabled={responding || (responseData.status === "RESPONDED" && !responseData.response.trim())}
                    >
                      {responding ? "Submitting..." : "Submit Response"}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Your Response:</span>
                    <p className="mt-1 text-sm">{selectedContact.response}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedContact.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  )
}
