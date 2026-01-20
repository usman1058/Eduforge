import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/statistics - Get platform statistics
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
    const role = searchParams.get("role") || session.user.role

    let stats

    if (role === "ADMIN") {
      // Admin statistics
      const [
        totalUsers,
        totalRequests,
        totalPayments,
        pendingPayments,
        inProgressRequests,
        totalDeliverables,
        openTickets,
        totalRevenue,
      ] = await Promise.all([
        db.user.count({ where: { role: "STUDENT" } }),
        db.request.count(),
        db.payment.count(),
        db.payment.count({ where: { status: "PENDING" } }),
        db.request.count({ where: { status: "IN_PROGRESS" } }),
        db.deliverable.count(),
        db.ticket.count({ where: { status: "OPEN" } }),
        db.payment.aggregate({
          where: { status: "APPROVED" },
          _sum: { amount: true },
        }),
      ])

      stats = {
        totalUsers,
        totalRequests,
        totalPayments,
        pendingPayments,
        inProgressRequests,
        totalDeliverables,
        openTickets,
        totalRevenue: totalRevenue._sum.amount || 0,
      }
    } else {
      // Student statistics
      const [
        userRequests,
        pendingRequests,
        inProgressRequests,
        deliveredRequests,
        userPayments,
        approvedPayments,
        pendingPayments,
        userTickets,
        openTickets,
      ] = await Promise.all([
        db.request.count({ where: { userId: session.user.id } }),
        db.request.count({
          where: {
            userId: session.user.id,
            status: { in: ["CREATED", "PAYMENT_SUBMITTED", "PAYMENT_APPROVED"] },
          },
        }),
        db.request.count({
          where: { userId: session.user.id, status: "IN_PROGRESS" },
        }),
        db.request.count({
          where: { userId: session.user.id, status: "DELIVERED" },
        }),
        db.payment.count({
          where: { userId: session.user.id },
        }),
        db.payment.count({
          where: {
            userId: session.user.id,
            status: "APPROVED",
          },
        }),
        db.payment.count({
          where: {
            userId: session.user.id,
            status: "PENDING",
          },
        }),
        db.ticket.count({
          where: { userId: session.user.id },
        }),
        db.ticket.count({
          where: {
            userId: session.user.id,
            status: "OPEN",
          },
        }),
      ])

      stats = {
        userRequests,
        pendingRequests,
        inProgressRequests,
        deliveredRequests,
        userPayments,
        approvedPayments,
        pendingPayments,
        userTickets,
        openTickets,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
