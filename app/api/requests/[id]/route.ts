import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"
import { createProject } from "@/lib/db"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action, projectId } = await request.json()

    const sql = getSql()
    const requestResult = await sql`
      SELECT * FROM requests WHERE id = ${id}
    `

    if (requestResult.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const req = requestResult[0]

    if (action === "take") {
      if (req.status !== "pending") {
        return NextResponse.json({ error: "Request is not available" }, { status: 400 })
      }

      let finalProjectId = projectId

      if (!finalProjectId) {
        const projectName = `${req.request_type === "website" ? "אתר" : req.request_type === "software" ? "תוכנה" : "אחר"} - ${req.requester_name}`
        const projectKey = `REQ-${req.id.substring(4, 8).toUpperCase()}`
        
        const newProject = await createProject({
          name: projectName,
          key: projectKey,
          description: req.description,
          creatorId: user.id,
          environment: req.platform as "civilian" | "military",
        })

        finalProjectId = newProject.id
      }

      await sql`
        UPDATE requests
        SET 
          status = 'taken',
          taken_by_user_id = ${user.id},
          project_id = ${finalProjectId},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `

      const issueKey = `${finalProjectId.split("-")[1]}-1`
      await sql`
        INSERT INTO issues (id, key, title, description, type, status, priority, project_id, reporter_id)
        VALUES (
          ${`issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
          ${issueKey},
          ${`בקשה: ${req.requester_name} - ${req.department}`},
          ${`**מספר אישי:** ${req.personal_number}\n**מדור:** ${req.department}\n**טלפון:** ${req.phone}\n**פלטפורמה:** ${req.platform === "military" ? "צה\"לי" : "אזרחי"}\n**סוג:** ${req.request_type === "website" ? "אתר" : req.request_type === "software" ? "תוכנה" : "אחר"}\n\n**אפיון:**\n${req.description}`},
          ${req.request_type === "website" ? "task" : "feature"},
          'todo',
          'medium',
          ${finalProjectId},
          ${user.id}
        )
      `

      return NextResponse.json({ success: true, projectId: finalProjectId })
    }

    if (action === "reject") {
      await sql`
        UPDATE requests
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
      return NextResponse.json({ success: true })
    }

    if (action === "complete") {
      await sql`
        UPDATE requests
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error updating request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}



