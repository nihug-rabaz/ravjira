import { NextResponse } from "next/server"

const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
const VERCEL_TOKEN = process.env.VERCEL_TOKEN

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId") || VERCEL_TEAM_ID
    const token = searchParams.get("token") || VERCEL_TOKEN

    if (!token) {
      return NextResponse.json({ error: "Vercel token is required" }, { status: 400 })
    }

    const response = await fetch(`https://api.vercel.com/v9/projects?teamId=${teamId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Vercel API error:", error)
      return NextResponse.json({ error: "Failed to fetch Vercel projects" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(
      data.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        accountId: project.accountId,
        teamId: project.teamId,
        url: project.alias?.[0] || `https://${project.name}.vercel.app`,
        framework: project.framework,
        createdAt: project.createdAt,
      }))
    )
  } catch (error) {
    console.error("[v0] Error fetching Vercel projects:", error)
    return NextResponse.json({ error: "Failed to fetch Vercel projects" }, { status: 500 })
  }
}

