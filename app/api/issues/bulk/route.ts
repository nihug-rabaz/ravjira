import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSqlInstance() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function PATCH(request: Request) {
  try {
    const { issueIds, updates } = await request.json()
    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json({ error: "issueIds array is required" }, { status: 400 })
    }
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "updates object is required" }, { status: 400 })
    }

    const sql = getSqlInstance()
    const allowedFields = ["status", "priority", "type", "assignee_id", "epic_id"]
    let hasUpdates = false

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === "assigneeId" ? "assignee_id" : key === "epicId" ? "epic_id" : key
      if (allowedFields.includes(dbKey)) {
        hasUpdates = true
        if (value === null || value === "") {
          await sql`UPDATE issues SET ${sql(dbKey)} = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ANY(${issueIds})`
        } else {
          await sql`UPDATE issues SET ${sql(dbKey)} = ${value}, updated_at = CURRENT_TIMESTAMP WHERE id = ANY(${issueIds})`
        }
      }
    }

    if (!hasUpdates) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    return NextResponse.json({ success: true, updated: issueIds.length })
  } catch (error) {
    console.error("[v0] Error performing bulk update:", error)
    return NextResponse.json({ error: "Failed to perform bulk update" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { issueIds } = await request.json()
    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json({ error: "issueIds array is required" }, { status: 400 })
    }

    const sql = getSqlInstance()
    await sql`
      DELETE FROM comments WHERE issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM issue_labels WHERE issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM issue_history WHERE issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM attachments WHERE issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM subtasks WHERE parent_issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM time_logs WHERE issue_id = ANY(${issueIds})
    `
    await sql`
      DELETE FROM issues WHERE id = ANY(${issueIds})
    `

    return NextResponse.json({ success: true, deleted: issueIds.length })
  } catch (error) {
    console.error("[v0] Error performing bulk delete:", error)
    return NextResponse.json({ error: "Failed to perform bulk delete" }, { status: 500 })
  }
}

