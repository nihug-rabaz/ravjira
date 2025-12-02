import { NextResponse } from "next/server"
import { getProjects, createProject } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] POST /api/projects - start")

    const user = await getCurrentUser()
    console.log("[v0] Current user:", user)

    if (!user) {
      console.log("[v0] No user found - unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { name, key, description, avatar } = body

    if (!name || !key) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Name and key are required" }, { status: 400 })
    }

    console.log("[v0] Creating project...")

    const project = await createProject({
      name,
      key: key.toUpperCase(),
      description: description || "",
      avatar,
      creatorId: user.id,
    })

    console.log("[v0] Project created successfully:", project)
    return NextResponse.json(project)
  } catch (error) {
    console.error("[v0] Error creating project:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    })
    return NextResponse.json(
      { error: "Failed to create project", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
