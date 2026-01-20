import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// GET /api/users/[id] - Get user details
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

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isSuspended: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        _count: {
          select: {
            requests: true,
            payments: true,
            tickets: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check authorization - users can view their own profile
    if (session.user.role === "STUDENT" && user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
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

    // Check authorization
    const targetUser = await db.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (session.user.role === "STUDENT" && targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Build update data based on role
    const updateData: any = {}

    // Fields users can update for themselves
    if (session.user.id === targetUser.id || session.user.role === "ADMIN") {
      if (body.name !== undefined) updateData.name = body.name
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.avatar !== undefined) updateData.avatar = body.avatar
    }

    // Password update
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12)
    }

    // Admin-only fields
    if (session.user.role === "ADMIN") {
      if (body.isSuspended !== undefined) {
        updateData.isSuspended = body.isSuspended
        updateData.suspendedAt = body.isSuspended ? new Date() : null
        updateData.suspendedReason = body.suspendedReason
      }
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isSuspended: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entityType: "USER",
        entityId: user.id,
        changes: JSON.stringify(Object.keys(updateData)),
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
