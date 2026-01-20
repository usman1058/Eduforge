import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

// POST /api/auth/forgot-password - Initiate password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        { message: "If a user exists with this email, they will receive a reset link." }
      )
    }

    // Generate reset token
    const resetToken = randomUUID()

    // Set token expiration (1 hour from now)
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)

    // Update user with reset token
    await db.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // In production, you would send an email here with the reset link
    // For now, we'll just log it and return it
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`

    console.log("Password reset link:", resetLink)

    return NextResponse.json({
      message: "Password reset link sent",
      link: resetLink,
    }, { status: 200 })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
