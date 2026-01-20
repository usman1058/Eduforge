import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/tickets/[id]/replies - Add reply to ticket
export async function POST(
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

    const body = await req.json()

    // Verify ticket exists and user has access
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
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

    const reply = await db.ticketReply.create({
      data: {
        content: body.content,
        ticketId: params.id,
        userId: session.user.id,
        isAdmin: session.user.role === "ADMIN",
      },
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
    })

    // Update ticket status if it's closed
    if (ticket.status === "CLOSED") {
      await db.ticket.update({
        where: { id: params.id },
        data: { status: "IN_PROGRESS" },
      })
    }

    // Notify the other party
    if (session.user.role === "ADMIN") {
      // Notify student
      await db.notification.create({
        data: {
          userId: ticket.userId,
          type: "TICKET_UPDATED",
          title: "New Reply on Your Ticket",
          message: `Admin has replied to your ticket "${ticket.title}".`,
          link: `/student/tickets/${ticket.id}`,
        },
      })
    } else {
      // Notify admins
      const admins = await db.user.findMany({
        where: { role: "ADMIN" },
      })

      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            type: "TICKET_UPDATED",
            title: "New Reply on Ticket",
            message: `Student has replied to ticket "${ticket.title}".`,
            link: `/admin/tickets/${ticket.id}`,
          },
        })
      }
    }

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}
