import { NextResponse } from "next/server"
import { getProject, addGitHubRepoToProject, removeGitHubRepoFromProject } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await getProject(id)
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      githubRepos: project.githubRepos || [],
    })
  } catch (error) {
    console.error("[v0] Error fetching GitHub integration:", error)
    return NextResponse.json({ error: "Failed to fetch GitHub integration" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Parse GitHub URL: https://github.com/owner/repo
    const githubUrlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/
    const match = repoUrl.match(githubUrlPattern)

    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, "")

    const addedRepo = await addGitHubRepoToProject(id, repoUrl, owner, cleanRepo)

    const sql = getSql()
    const githubToken = process.env.GITHUB_TOKEN
    if (githubToken) {
      await sql`
        UPDATE projects 
        SET github_access_token = ${githubToken}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND github_access_token IS NULL
      `
    }

    return NextResponse.json(addedRepo)
  } catch (error: any) {
    console.error("[v0] Error connecting GitHub:", error)
    if (error.message?.includes("duplicate") || error.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Repository already connected to this project" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to connect GitHub" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const repoId = searchParams.get("repoId")

    if (!repoId) {
      return NextResponse.json({ error: "Repository ID is required" }, { status: 400 })
    }

    await removeGitHubRepoFromProject(id, repoId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error disconnecting GitHub:", error)
    return NextResponse.json({ error: "Failed to disconnect GitHub" }, { status: 500 })
  }
}
