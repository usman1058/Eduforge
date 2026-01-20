import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/files/create-from-temp - Create file record from temp data (after authentication)
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
    const { requestId, fileName, fileSize, fileType } = body

    if (!requestId || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create file record (in production, you'd move the actual file)
    const file = await db.file.create({
      data: {
        fileName,
        fileUrl: `/uploads/${requestId}/${fileName}`, // Placeholder URL
        fileType: fileType || "application/octet-stream",
        fileSize: fileSize || 0,
        userId: session.user.id,
        requestId,
      },
    })

    return NextResponse.json(file, { status: 201 })
  } catch (error) {
    console.error("Error creating file:", error)
    return NextResponse.json(
      { error: "Failed to create file record" },
      { status: 500 }
    )
  }
}
