import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/payments/[id]/dispute - Create payment dispute
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

    // Verify payment exists and belongs to user
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: { request: true },
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    if (
      session.user.role === "STUDENT" &&
      payment.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const dispute = await db.paymentDispute.create({
      data: {
        paymentId: params.id,
        explanation: body.explanation,
        additionalFiles: body.additionalFiles || "",
      },
    })

    // Update payment status
    await db.payment.update({
      where: { id: params.id },
      data: { status: "UNDER_REVIEW" },
    })

    // Create notification for admins
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "PAYMENT_REJECTED",
          title: "New Payment Dispute",
          message: `A new dispute has been filed for payment ${payment.referenceNumber}.`,
          link: `/admin/payments/${payment.id}`,
        },
      })
    }

    return NextResponse.json(dispute, { status: 201 })
  } catch (error) {
    console.error("Error creating dispute:", error)
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    )
  }
}

// PUT /api/payments/[id]/dispute - Resolve payment dispute (admin only)
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

    const dispute = await db.paymentDispute.update({
      where: { paymentId: params.id },
      data: {
        adminResponse: body.adminResponse,
        status: body.status,
        resolvedAt: body.status === "RESOLVED" ? new Date() : null,
      },
      include: { payment: true },
    })

    // Update payment status if dispute is resolved
    if (body.status === "RESOLVED" && body.approvePayment) {
      await db.payment.update({
        where: { id: params.id },
        data: { status: "APPROVED" },
      })

      await db.request.update({
        where: { id: dispute.payment.requestId },
        data: { status: "PAYMENT_APPROVED" },
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RESOLVE_PAYMENT_DISPUTE",
        entityType: "PAYMENT_DISPUTE",
        entityId: dispute.id,
        changes: JSON.stringify(body),
      },
    })

    // Create notification for student
    await db.notification.create({
      data: {
        userId: dispute.payment.userId,
        type: "PAYMENT_APPROVED",
        title: "Dispute Resolved",
        message: `Your payment dispute has been ${body.status.toLowerCase()}.`,
        link: `/student/payments/${dispute.payment.id}`,
      },
    })

    return NextResponse.json(dispute)
  } catch (error) {
    console.error("Error resolving dispute:", error)
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    )
  }
}
