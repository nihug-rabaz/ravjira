import { NextResponse } from "next/server"
import { getProject, addVercelProjectToProject, removeVercelProjectFromProject } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await getProject(id)
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      vercelProjects: project.vercelProjects || [],
    })
  } catch (error) {
    console.error("[v0] Error fetching Vercel integration:", error)
    return NextResponse.json({ error: "Failed to fetch Vercel integration" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { vercelProjectId, vercelProjectName, vercelUrl } = await request.json()

    if (!vercelProjectId || !vercelProjectName) {
      return NextResponse.json({ error: "Vercel project ID and name are required" }, { status: 400 })
    }

    const addedProject = await addVercelProjectToProject(
      id,
      vercelProjectId,
      vercelProjectName,
      VERCEL_TEAM_ID,
      vercelUrl
    )

    return NextResponse.json(addedProject)
  } catch (error: any) {
    console.error("[v0] Error connecting Vercel:", error)
    if (error.message?.includes("duplicate") || error.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Vercel project already connected to this project" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to connect Vercel" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const vercelProjectId = searchParams.get("vercelProjectId")

    if (!vercelProjectId) {
      return NextResponse.json({ error: "Vercel project ID is required" }, { status: 400 })
    }

    await removeVercelProjectFromProject(id, vercelProjectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error disconnecting Vercel:", error)
    return NextResponse.json({ error: "Failed to disconnect Vercel" }, { status: 500 })
  }
}

