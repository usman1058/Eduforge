import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/requests - List requests (with filters)
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

    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      db.request.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          _count: {
            select: {
              files: true,
              deliverables: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.request.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

// POST /api/requests - Create a new request
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

    const request = await db.request.create({
      data: {
        title: body.title,
        instructions: body.instructions,
        academicLevel: body.academicLevel,
        deadline: new Date(body.deadline),
        notes: body.notes,
        userId: session.user.id,
        serviceId: body.serviceId,
        status: "CREATED",
      },
      include: {
        service: true,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_REQUEST",
        entityType: "REQUEST",
        entityId: request.id,
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    )
  }
}
