import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/tickets - List tickets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category")
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build where clause based on role
    const where: any = {}
    if (session.user.role === "STUDENT") {
      where.userId = session.user.id
    } else if (session.user.role === "ADMIN" && userId) {
      where.userId = userId
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
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
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ticket.count({ where }),
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const ticket = await db.ticket.create({
      data: {
        title: body.title,
        category: body.category,
        priority: body.priority || "MEDIUM",
        userId: session.user.id,
        requestId: body.requestId,
      },
    })

    // Add initial reply if provided
    if (body.content) {
      await db.ticketReply.create({
        data: {
          content: body.content,
          ticketId: ticket.id,
          userId: session.user.id,
          isAdmin: false,
        },
      })
    }

    // Create notification for admins
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "TICKET_CREATED",
          title: "New Support Ticket",
          message: `A new ticket "${ticket.title}" has been created.`,
          link: `/admin/tickets/${ticket.id}`,
        },
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TICKET",
        entityType: "TICKET",
        entityId: ticket.id,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    )
  }
}
