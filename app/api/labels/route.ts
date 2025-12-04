import { NextResponse } from "next/server"
import { getLabelsByProject, createLabel } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || undefined
    
    const labels = await getLabelsByProject(projectId)
    return NextResponse.json(labels)
  } catch (error) {
    console.error("[v0] Error fetching labels:", error)
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, color, projectId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const label = await createLabel({ name, color, projectId })
    return NextResponse.json(label)
  } catch (error) {
    console.error("[v0] Error creating label:", error)
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 })
  }
}


