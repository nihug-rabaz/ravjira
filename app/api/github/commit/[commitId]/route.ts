import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ commitId: string }> }) {
  try {
    const { commitId } = await params
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")
    const repo = searchParams.get("repo")
    const token = searchParams.get("token") || process.env.GITHUB_TOKEN

    if (!owner || !repo) {
      return NextResponse.json({ error: "owner and repo are required" }, { status: 400 })
    }

    if (!token) {
      return NextResponse.json({ error: "GitHub token is required" }, { status: 400 })
    }

    const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
      ? `token ${token}`
      : `Bearer ${token}`

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitId}`, {
      headers: {
        "Authorization": authHeader,
        "Accept": "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to fetch commit from GitHub" }, { status: response.status })
    }

    const commit = await response.json()

    return NextResponse.json({
      id: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url,
      stats: commit.stats,
      files: commit.files?.map((file: any) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching commit:", error)
    return NextResponse.json({ error: "Failed to fetch commit" }, { status: 500 })
  }
}

