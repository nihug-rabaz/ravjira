import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const platform = searchParams.get("platform")

    const sql = getSql()
    let query = sql`
      SELECT * FROM requests
      WHERE status = ${status}
    `

    if (platform) {
      query = sql`
        SELECT * FROM requests
        WHERE status = ${status} AND platform = ${platform}
      `
    }

    const requests = await query

    return NextResponse.json(
      requests.map((r: any) => ({
        id: r.id,
        requesterName: r.requester_name,
        personalNumber: r.personal_number,
        department: r.department,
        phone: r.phone,
        platform: r.platform,
        requestType: r.request_type,
        description: r.description,
        status: r.status,
        takenByUserId: r.taken_by_user_id || undefined,
        projectId: r.project_id || undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }))
    )
  } catch (error) {
    console.error("[v0] Error fetching requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      requesterName,
      personalNumber,
      department,
      phone,
      platform,
      requestType,
      description,
    } = body

    if (
      !requesterName ||
      !personalNumber ||
      !department ||
      !phone ||
      !platform ||
      !requestType ||
      !description
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!["civilian", "military"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }

    if (!["website", "software", "other"].includes(requestType)) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }

    const sql = getSql()
    const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO requests (
        id, requester_name, personal_number, department, phone, platform, request_type, description
      )
      VALUES (
        ${id},
        ${requesterName},
        ${personalNumber},
        ${department},
        ${phone},
        ${platform},
        ${requestType},
        ${description}
      )
    `

    const result = await sql`
      SELECT * FROM requests WHERE id = ${id}
    `

    const r = result[0]
    return NextResponse.json(
      {
        id: r.id,
        requesterName: r.requester_name,
        personalNumber: r.personal_number,
        department: r.department,
        phone: r.phone,
        platform: r.platform,
        requestType: r.request_type,
        description: r.description,
        status: r.status,
        createdAt: r.created_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error creating request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}


