import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

// POST /api/files/upload-temp - Upload temporary files (before user is authenticated)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "temp")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFileName = `${randomUUID()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Return file URL
    const fileUrl = `/uploads/temp/${uniqueFileName}`

    return NextResponse.json({
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Error uploading temp file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
