import { NextResponse } from "next/server"
import { getIssue } from "@/lib/db"
import { getProject } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const repoId = searchParams.get("repoId")
    const { accessToken } = await request.json()

    const issue = await getIssue(id)
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    const project = await getProject(issue.projectId)
    if (!project || !project.githubRepos || project.githubRepos.length === 0) {
      return NextResponse.json({ error: "Project not connected to GitHub" }, { status: 400 })
    }

    let selectedRepo
    if (repoId) {
      selectedRepo = project.githubRepos.find((r) => r.id === repoId)
    } else {
      selectedRepo = project.githubRepos[0]
    }

    if (!selectedRepo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Get access token from project, request, or environment
    let token = accessToken
    if (!token) {
      const sql = getSql()
      const result = await sql`
        SELECT github_access_token FROM projects WHERE id = ${issue.projectId}
      `
      if (result.length > 0 && result[0].github_access_token) {
        token = result[0].github_access_token
      } else {
        token = process.env.GITHUB_TOKEN
      }
    }

    // Create GitHub issue
    const githubIssue = {
      title: `${issue.key}: ${issue.title}`,
      body: `**Description:**\n${issue.description || "No description"}\n\n**Type:** ${issue.type}\n**Priority:** ${issue.priority}\n\n**Original Issue:** ${issue.key}`,
      labels: issue.type === "bug" ? ["bug"] : issue.type === "feature" ? ["enhancement"] : [],
    }

    const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
      ? `token ${token}`
      : `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${selectedRepo.githubOwner}/${selectedRepo.githubRepo}/issues`,
      {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(githubIssue),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to create GitHub issue" }, { status: response.status })
    }

    const createdIssue = await response.json()

    return NextResponse.json({
      success: true,
      githubIssueUrl: createdIssue.html_url,
      githubIssueNumber: createdIssue.number,
    })
  } catch (error) {
    console.error("[v0] Error creating GitHub issue:", error)
    return NextResponse.json({ error: "Failed to create GitHub issue" }, { status: 500 })
  }
}

