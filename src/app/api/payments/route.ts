import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/payments - List payments
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
    const viewAll = searchParams.get("viewAll") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build where clause based on role
    const where: any = {}

    // Admin can view all payments with viewAll=true, or filter by specific userId
    if (session.user.role === "ADMIN") {
      if (!viewAll && userId) {
        where.userId = userId
      }
      // If viewAll=true, show all payments (no userId filter)
    } else if (session.user.role === "STUDENT") {
      where.userId = session.user.id
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
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
              status: true,
            },
          },
          dispute: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

// POST /api/payments - Submit a payment
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

    // Verify request belongs to user
    const request = await db.request.findUnique({
      where: { id: body.requestId },
    })

    if (!request || request.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Request not found or unauthorized" },
        { status: 404 }
      )
    }

    // Generate unique reference number
    const referenceNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const payment = await db.payment.create({
      data: {
        referenceNumber,
        amount: body.amount,
        currency: body.currency || "USD",
        receiptUrl: body.receiptUrl,
        userId: session.user.id,
        requestId: body.requestId,
        status: "PENDING",
      },
    })

    // Update request status
    await db.request.update({
      where: { id: body.requestId },
      data: {
        status: "PAYMENT_SUBMITTED",
        paymentId: payment.id,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SUBMIT_PAYMENT",
        entityType: "PAYMENT",
        entityId: payment.id,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
