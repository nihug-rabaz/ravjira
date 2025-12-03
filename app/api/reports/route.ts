import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSqlInstance() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const reportType = searchParams.get("type") || "overview"

    const sql = getSqlInstance()

    if (reportType === "overview") {
      const stats = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'backlog') as backlog_count,
          COUNT(*) FILTER (WHERE status = 'todo') as todo_count,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_count,
          COUNT(*) FILTER (WHERE status = 'in-review') as in_review_count,
          COUNT(*) FILTER (WHERE status = 'done') as done_count,
          COUNT(*) as total_issues
        FROM issues
        WHERE ${projectId ? sql`project_id = ${projectId}` : sql`1=1`}
      `

      const byType = await sql`
        SELECT type, COUNT(*) as count
        FROM issues
        WHERE ${projectId ? sql`project_id = ${projectId}` : sql`1=1`}
        GROUP BY type
      `

      const byPriority = await sql`
        SELECT priority, COUNT(*) as count
        FROM issues
        WHERE ${projectId ? sql`project_id = ${projectId}` : sql`1=1`}
        GROUP BY priority
      `

      return NextResponse.json({
        stats: stats[0],
        byType,
        byPriority,
      })
    }

    if (reportType === "assignee") {
      const assigneeStats = await sql`
        SELECT 
          u.id,
          u.name,
          u.avatar,
          COUNT(i.id) FILTER (WHERE i.status != 'done') as open_issues,
          COUNT(i.id) FILTER (WHERE i.status = 'done') as closed_issues,
          COUNT(i.id) as total_issues
        FROM users u
        LEFT JOIN issues i ON i.assignee_id = u.id
        WHERE ${projectId ? sql`i.project_id = ${projectId}` : sql`1=1`}
        GROUP BY u.id, u.name, u.avatar
        HAVING COUNT(i.id) > 0
        ORDER BY total_issues DESC
      `

      return NextResponse.json(assigneeStats)
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

