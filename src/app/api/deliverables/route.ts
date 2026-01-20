import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/deliverables - List deliverables
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
    const requestId = searchParams.get("requestId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build where clause based on role
    const where: any = {}
    if (requestId) {
      where.requestId = requestId
      // If student, verify they own the request
      if (session.user.role === "STUDENT") {
        const request = await db.request.findUnique({
          where: { id: requestId },
        })

        if (request?.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          )
        }
      }
    } else if (session.user.role === "STUDENT") {
      // Students can only see deliverables for their delivered requests
      const userRequests = await db.request.findMany({
        where: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "CLOSED"] },
        },
        select: { id: true },
      })

      where.requestId = {
        in: userRequests.map(r => r.id),
      }
    }

    const [deliverables, total] = await Promise.all([
      db.deliverable.findMany({
        where,
        include: {
          request: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.deliverable.count({ where }),
    ])

    return NextResponse.json({
      deliverables,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching deliverables:", error)
    return NextResponse.json(
      { error: "Failed to fetch deliverables" },
      { status: 500 }
    )
  }
}

// POST /api/deliverables - Upload deliverable (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Verify request exists
    const request = await db.request.findUnique({
      where: { id: body.requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    const deliverable = await db.deliverable.create({
      data: {
        fileName: body.fileName,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize,
        description: body.description,
        requestId: body.requestId,
      },
    })

    // Update request status if first deliverable
    const deliverableCount = await db.deliverable.count({
      where: { requestId: body.requestId },
    })

    if (deliverableCount === 1 && request.status !== "DELIVERED") {
      await db.request.update({
        where: { id: body.requestId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_DELIVERABLE",
        entityType: "DELIVERABLE",
        entityId: deliverable.id,
        changes: JSON.stringify({ requestId: body.requestId }),
      },
    })

    // Notify student
    await db.notification.create({
      data: {
        userId: request.userId,
        type: "REQUEST_DELIVERED",
        title: "New Deliverable Available",
        message: `A new deliverable has been added to your request "${request.title}".`,
        link: `/student/requests/${request.id}`,
      },
    })

    return NextResponse.json(deliverable, { status: 201 })
  } catch (error) {
    console.error("Error uploading deliverable:", error)
    return NextResponse.json(
      { error: "Failed to upload deliverable" },
      { status: 500 }
    )
  }
}
