import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/contact - Submit contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Create contact submission
    const contact = await db.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "PENDING",
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error creating contact submission:", error)
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again." },
      { status: 500 }
    )
  }
}
