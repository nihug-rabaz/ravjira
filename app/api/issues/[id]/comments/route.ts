import { NextResponse } from "next/server"
import { getCommentsByIssue, createComment } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const comments = await getCommentsByIssue(id)
    return NextResponse.json(comments)
  } catch (error) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const comment = await createComment({
      ...body,
      issueId: id,
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
