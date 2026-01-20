import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/auth/validate-reset-token?token=xxx - Validate password reset token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gte: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (user.resetTokenExpires && new Date() > new Date(user.resetTokenExpires)) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    }, { status: 200 })
  } catch (error) {
    console.error("Error validating reset token:", error)
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    )
  }
}
