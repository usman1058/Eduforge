import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// GET /api/files - List files for a request
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
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      )
    }

    // Verify request access
    const request = await db.request.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    if (session.user.role === "STUDENT" && request.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const files = await db.file.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}

// POST /api/files - Upload file
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const requestId = formData.get("requestId") as string

    if (!file || !requestId) {
      return NextResponse.json(
        { error: "File and request ID are required" },
        { status: 400 }
      )
    }

    // Verify request ownership
    const request = await db.request.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    if (session.user.role === "STUDENT" && request.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Get file settings
    const settings = await db.systemSetting.findMany({
      where: { category: "files" },
    })

    const maxFileSizeSetting = settings.find(s => s.key === "max_file_size_mb")
    const maxFileSize = maxFileSizeSetting ? parseInt(maxFileSizeSetting.value) : 10

    const allowedTypesSetting = settings.find(s => s.key === "allowed_file_types")
    const allowedTypes = allowedTypesSetting ? allowedTypesSetting.value.split(",") : ["pdf", "doc", "docx", "zip", "mp3", "wav"]

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${maxFileSize}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const uniqueName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueName)

    await writeFile(filePath, buffer)

    // Save file record to database
    const uploadedFile = await db.file.create({
      data: {
        fileName: file.name,
        fileUrl: `/uploads/${uniqueName}`,
        fileType: file.type,
        fileSize: file.size,
        userId: session.user.id,
        requestId: requestId,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_FILE",
        entityType: "FILE",
        entityId: uploadedFile.id,
        changes: JSON.stringify({
          fileName: file.name,
          requestId,
        }),
      },
    })

    return NextResponse.json(uploadedFile, { status: 201 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
