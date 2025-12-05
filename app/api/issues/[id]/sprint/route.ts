import { NextResponse } from "next/server"
import { addIssueToSprint, removeIssueFromSprint } from "@/lib/db"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { sprintId } = await request.json()
    await addIssueToSprint(id, sprintId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding issue to sprint:", error)
    return NextResponse.json({ error: "Failed to add issue to sprint" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const sprintId = searchParams.get("sprintId")
    if (!sprintId) {
      return NextResponse.json({ error: "sprintId is required" }, { status: 400 })
    }
    await removeIssueFromSprint(id, sprintId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing issue from sprint:", error)
    return NextResponse.json({ error: "Failed to remove issue from sprint" }, { status: 500 })
  }
}

