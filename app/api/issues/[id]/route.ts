import { NextResponse } from "next/server"
import { getIssue, updateIssue, deleteIssue, addIssueHistory, createNotification } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const issue = await getIssue(id)

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error("[v0] Error fetching issue:", error)
    return NextResponse.json({ error: "Failed to fetch issue" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const user = await getCurrentUser()

    const currentIssue = await getIssue(id)
    if (!currentIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    const issue = await updateIssue(id, updates)

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    if (user) {
      const fieldMap: Record<string, string> = {
        title: "Title",
        description: "Description",
        type: "Type",
        status: "Status",
        priority: "Priority",
        assigneeId: "Assignee",
      }

      for (const [key, fieldName] of Object.entries(fieldMap)) {
        if (updates[key] !== undefined) {
          const oldValue = key === "assigneeId" 
            ? (currentIssue.assignee?.name || "Unassigned")
            : (currentIssue as any)[key]?.toString() || ""
          const newValue = key === "assigneeId"
            ? (updates[key] ? "Assigned" : "Unassigned")
            : updates[key]?.toString() || ""
          
          if (oldValue !== newValue) {
            await addIssueHistory({
              issueId: id,
              userId: user.id,
              field: fieldName,
              oldValue,
              newValue,
            })

            if (key === "assigneeId" && updates[key] && updates[key] !== currentIssue.assigneeId) {
              await createNotification({
                userId: updates[key],
                type: "issue_assigned",
                title: `Assigned to issue ${currentIssue.key}`,
                message: `${user.name} assigned you to "${currentIssue.title}"`,
                link: `/issue/${id}`,
              })
            }
          }
        }
      }
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error("[v0] Error updating issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteIssue(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting issue:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }
}
