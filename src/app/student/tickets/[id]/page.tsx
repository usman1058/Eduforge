"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentDashboardLayout } from "@/components/layouts/student-dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageSquare, Clock, User, Send, Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Reply {
  id: string
  content: string
  isAdmin: boolean
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Ticket {
  id: string
  title: string
  category: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  createdAt: string
  updatedAt: string
  replies: Reply[]
  request?: {
    id: string
    title: string
  }
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [reply, setReply] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchTicket()
  }, [session, router, params.id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/student/tickets")
          return
        }
        throw new Error("Failed to fetch ticket")
      }

      const data = await response.json()
      setTicket(data)
    } catch (error) {
      console.error("Error fetching ticket:", error)
      router.push("/student/tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return

    setSending(true)

    try {
      const response = await fetch(`/api/tickets/${params.id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: reply }),
      })

      if (!response.ok) throw new Error("Failed to send reply")

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully.",
      })

      setReply("")
      fetchTicket()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      OPEN: { variant: "default", label: "Open" },
      IN_PROGRESS: { variant: "secondary", label: "In Progress" },
      RESOLVED: { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Resolved" },
      CLOSED: { variant: "outline", label: "Closed" },
    }
    const config = variants[status] || variants.OPEN
    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-500",
      MEDIUM: "bg-yellow-500",
      HIGH: "bg-orange-500",
      URGENT: "bg-red-500",
    }
    return (
      <Badge className={`${colors[priority] || colors.LOW} text-white`}>
        {priority}
      </Badge>
    )
  }

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <StudentDashboardLayout>
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The ticket you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/student/tickets")}>
            Back to Tickets
          </Button>
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{ticket.title}</h1>
            <p className="text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground capitalize">
                  {ticket.category.replace("_", " ").toLowerCase()}
                </span>
              </div>
              <div>{getPriorityBadge(ticket.priority)}</div>
              <div>{getStatusBadge(ticket.status)}</div>
              <div className="flex items-center gap-2 ml-auto">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardHeader>
          {ticket.request && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Related to request:{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/student/requests/${ticket.request!.id}`)}
                >
                  {ticket.request.title}
                </Button>
              </p>
            </CardContent>
          )}
        </Card>

        {/* Conversation */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>
              {ticket.replies.length} message{ticket.replies.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Original Ticket Message */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">You</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Original ticket created.
                </p>
              </div>

              {/* Replies */}
              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg ${
                    reply.isAdmin
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {reply.isAdmin ? (
                      <span className="text-xs font-medium text-primary">
                        Support Team
                      </span>
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {reply.isAdmin ? "" : reply.user.name || "You"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {ticket.status !== "CLOSED" && (
              <form onSubmit={handleReply} className="mt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    disabled={sending}
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={sending}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                    <Button type="submit" disabled={sending || !reply.trim()}>
                      {sending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {ticket.status === "CLOSED" && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  This ticket has been closed. If you need further assistance, please create a new ticket.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push("/student/tickets")}
                >
                  Create New Ticket
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  )
}
