import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/settings - Get system settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const where = category ? { category } : {}

    const settings = await db.systemSetting.findMany({
      where,
      orderBy: { category: "asc" },
    })

    // Convert to key-value object
    const settingsObj: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// POST /api/settings - Update system settings (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const settings = []

    for (const [key, value] of Object.entries(body)) {
      const setting = await db.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          category: body._category || "general",
        },
      })
      settings.push(setting)
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SETTINGS",
        entityType: "SETTINGS",
        entityId: "SYSTEM",
        changes: JSON.stringify(Object.keys(body)),
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
