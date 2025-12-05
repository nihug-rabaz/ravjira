import { NextResponse } from "next/server"
import { getSavedFilters, createSavedFilter } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const filters = await getSavedFilters(user.id, projectId || undefined)
    return NextResponse.json(filters)
  } catch (error) {
    console.error("[v0] Error fetching saved filters:", error)
    return NextResponse.json({ error: "Failed to fetch saved filters" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const filter = await createSavedFilter({
      ...body,
      userId: user.id,
    })
    return NextResponse.json(filter)
  } catch (error) {
    console.error("[v0] Error creating saved filter:", error)
    return NextResponse.json({ error: "Failed to create saved filter" }, { status: 500 })
  }
}

