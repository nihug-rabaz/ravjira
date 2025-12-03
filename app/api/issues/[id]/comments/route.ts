import { NextResponse } from "next/server"
import { getCommentsByIssue, createComment, updateComment, deleteComment, getIssue, createNotification } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

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
    const user = await getCurrentUser()

    const comment = await createComment({
      ...body,
      issueId: id,
    })

    if (user) {
      const issue = await getIssue(id)
      if (issue && issue.reporterId !== user.id && issue.assigneeId !== user.id) {
        await createNotification({
          userId: issue.reporterId,
          type: "comment_added",
          title: `New comment on ${issue.key}`,
          message: `${user.name} commented on "${issue.title}"`,
          link: `/issue/${id}`,
        })

        if (issue.assigneeId && issue.assigneeId !== issue.reporterId) {
          await createNotification({
            userId: issue.assigneeId,
            type: "comment_added",
            title: `New comment on ${issue.key}`,
            message: `${user.name} commented on "${issue.title}"`,
            link: `/issue/${id}`,
          })
        }
      }
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
