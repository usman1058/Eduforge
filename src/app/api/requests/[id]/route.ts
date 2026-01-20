import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/requests/[id] - Get request details
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

    const request = await db.request.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
        payment: {
          include: {
            dispute: true,
          },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        deliverables: {
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      session.user.role === "STUDENT" &&
      request.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(request)
  } catch (error) {
    console.error("Error fetching request:", error)
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    )
  }
}

// PUT /api/requests/[id] - Update request status (admin only)
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

    const request = await db.request.update({
      where: { id: params.id },
      data: {
        status: body.status,
        rejectionReason: body.rejectionReason,
        deliveredAt: body.status === "DELIVERED" ? new Date() : null,
        closedAt: body.status === "CLOSED" ? new Date() : null,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: `UPDATE_REQUEST_STATUS_${body.status}`,
        entityType: "REQUEST",
        entityId: request.id,
        changes: JSON.stringify(body),
      },
    })

    // Create notification for student
    if (body.status === "DELIVERED" || body.status === "CLOSED") {
      await db.notification.create({
        data: {
          userId: request.userId,
          type: body.status === "DELIVERED" ? "REQUEST_DELIVERED" : "REQUEST_UPDATED",
          title: body.status === "DELIVERED" ? "Request Delivered" : "Request Updated",
          message: body.status === "DELIVERED"
            ? `Your request "${request.title}" has been delivered.`
            : `Your request "${request.title}" status has been updated to ${body.status}.`,
          link: `/student/requests/${request.id}`,
        },
      })
    }

    return NextResponse.json(request)
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}
