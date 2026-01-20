import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/tickets/[id] - Get ticket details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      session.user.role === "STUDENT" &&
      ticket.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    )
  }
}

// PUT /api/tickets/[id] - Update ticket status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const ticket = await db.ticket.update({
      where: { id: params.id },
      data: {
        status: body.status,
        priority: body.priority,
        resolvedAt: body.status === "RESOLVED" || body.status === "CLOSED"
          ? new Date()
          : null,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: `UPDATE_TICKET_STATUS_${body.status}`,
        entityType: "TICKET",
        entityId: ticket.id,
        changes: JSON.stringify(body),
      },
    })

    // Create notification for student
    await db.notification.create({
      data: {
        userId: ticket.userId,
        type: "TICKET_UPDATED",
        title: "Ticket Updated",
        message: `Your ticket "${ticket.title}" status has been updated to ${body.status}.`,
        link: `/student/tickets/${ticket.id}`,
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    )
  }
}
