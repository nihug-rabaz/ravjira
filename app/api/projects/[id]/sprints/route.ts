import { NextResponse } from "next/server"
import { getSprintsByProject, createSprint } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sprints = await getSprintsByProject(id)
    return NextResponse.json(sprints)
  } catch (error) {
    console.error("[v0] Error fetching sprints:", error)
    return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const sprint = await createSprint({
      ...body,
      projectId: id,
    })
    return NextResponse.json(sprint)
  } catch (error) {
    console.error("[v0] Error creating sprint:", error)
    return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 })
  }
}

