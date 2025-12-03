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
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"

    if (!query.trim()) {
      return NextResponse.json({ issues: [], projects: [] })
    }

    const sql = getSqlInstance()
    const results: { issues: any[]; projects: any[] } = { issues: [], projects: [] }

    if (type === "all" || type === "issues") {
      const issues = await sql`
        SELECT 
          i.*,
          json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'avatar', a.avatar) as assignee,
          json_build_object('id', r.id, 'name', r.name, 'email', r.email, 'avatar', r.avatar) as reporter
        FROM issues i
        LEFT JOIN users a ON i.assignee_id = a.id
        LEFT JOIN users r ON i.reporter_id = r.id
        WHERE i.title ILIKE ${`%${query}%`} OR i.description ILIKE ${`%${query}%`} OR i.key ILIKE ${`%${query}%`}
        ORDER BY i.updated_at DESC
        LIMIT 20
      `

      results.issues = issues.map((i) => ({
        ...i,
        projectId: i.project_id,
        assigneeId: i.assignee_id,
        reporterId: i.reporter_id,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }))
    }

    if (type === "all" || type === "projects") {
      const projects = await sql`
        SELECT * FROM projects
        WHERE name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`} OR key ILIKE ${`%${query}%`}
        ORDER BY updated_at DESC
        LIMIT 10
      `

      results.projects = projects.map((p) => ({
        ...p,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Error searching:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}

