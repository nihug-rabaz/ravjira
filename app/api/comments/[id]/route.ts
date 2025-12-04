import { NextResponse } from "next/server"
import { updateComment, deleteComment } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await updateComment(id, content)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[v0] Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteComment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}


