import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/payments/[id] - Get payment details
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

    const payment = await db.payment.findUnique({
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
          include: {
            service: true,
          },
        },
        dispute: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      session.user.role === "STUDENT" &&
      payment.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    )
  }
}

// PUT /api/payments/[id] - Update payment status (admin only)
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

    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: body.status,
        rejectionReason: body.rejectionReason,
        fraudFlagged: body.fraudFlagged,
        fraudNotes: body.fraudNotes,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
      include: {
        request: true,
      },
    })

    // Update request status based on payment approval
    if (body.status === "APPROVED") {
      await db.request.update({
        where: { id: payment.requestId },
        data: { status: "PAYMENT_APPROVED" },
      })
    } else if (body.status === "REJECTED") {
      await db.request.update({
        where: { id: payment.requestId },
        data: { status: "PAYMENT_REJECTED" },
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: `UPDATE_PAYMENT_STATUS_${body.status}`,
        entityType: "PAYMENT",
        entityId: payment.id,
        changes: JSON.stringify(body),
      },
    })

    // Create notification for student
    await db.notification.create({
      data: {
        userId: payment.userId,
        type: body.status === "APPROVED" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
        title: body.status === "APPROVED" ? "Payment Approved" : "Payment Rejected",
        message: body.status === "APPROVED"
          ? `Your payment for request "${payment.request.title}" has been approved.`
          : `Your payment for request "${payment.request.title}" has been rejected. ${body.rejectionReason || ""}`,
        link: `/student/payments/${payment.id}`,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}
