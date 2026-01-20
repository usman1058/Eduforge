import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/services - List all services
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const active = searchParams.get("active")

    const where = active === "false" ? {} : { isActive: true }

    const services = await db.service.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

// POST /api/services - Create a new service (admin only)
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

    const service = await db.service.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        longDescription: body.longDescription,
        idealUseCase: body.idealUseCase,
        estimatedTurnaround: body.estimatedTurnaround,
        price: body.price || 0,
        pricingNote: body.pricingNote,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
