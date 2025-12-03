import { NextResponse } from "next/server"
import { getSubtasksByIssue, createSubtask, updateSubtask, deleteSubtask } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subtasks = await getSubtasksByIssue(id)
    return NextResponse.json(subtasks)
  } catch (error) {
    console.error("[v0] Error fetching subtasks:", error)
    return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { title } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const subtask = await createSubtask({ issueId: id, title })
    return NextResponse.json(subtask)
  } catch (error) {
    console.error("[v0] Error creating subtask:", error)
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { subtaskId, ...updates } = await request.json()

    if (!subtaskId) {
      return NextResponse.json({ error: "Subtask ID is required" }, { status: 400 })
    }

    const subtask = await updateSubtask(subtaskId, updates)

    if (!subtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    return NextResponse.json(subtask)
  } catch (error) {
    console.error("[v0] Error updating subtask:", error)
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const subtaskId = searchParams.get("subtaskId")

    if (!subtaskId) {
      return NextResponse.json({ error: "Subtask ID is required" }, { status: 400 })
    }

    await deleteSubtask(subtaskId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting subtask:", error)
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 })
  }
}

