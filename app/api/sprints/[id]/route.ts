import { NextResponse } from "next/server"
import { getSprint, updateSprint, deleteSprint, getIssuesBySprint } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sprint = await getSprint(id)
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }
    const issues = await getIssuesBySprint(id)
    return NextResponse.json({ ...sprint, issues })
  } catch (error) {
    console.error("[v0] Error fetching sprint:", error)
    return NextResponse.json({ error: "Failed to fetch sprint" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const sprint = await updateSprint(id, updates)
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }
    return NextResponse.json(sprint)
  } catch (error) {
    console.error("[v0] Error updating sprint:", error)
    return NextResponse.json({ error: "Failed to update sprint" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteSprint(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting sprint:", error)
    return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 })
  }
}

