import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token") || process.env.GITHUB_TOKEN

    if (!token) {
      return NextResponse.json({ error: "GitHub token is required" }, { status: 400 })
    }

    const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
      ? `token ${token}`
      : `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      {
        headers: {
          "Authorization": authHeader,
          "Accept": "application/vnd.github.v3+json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to fetch latest commit" }, { status: response.status })
    }

    const commits = await response.json()

    if (!Array.isArray(commits) || commits.length === 0) {
      return NextResponse.json({ error: "No commits found" }, { status: 404 })
    }

    const latestCommit = commits[0]

    // Fetch full commit details
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${latestCommit.sha}`,
      {
        headers: {
          "Authorization": authHeader,
          "Accept": "application/vnd.github.v3+json",
        },
      }
    )

    if (!commitResponse.ok) {
      return NextResponse.json({
        id: latestCommit.sha,
        message: latestCommit.commit?.message || "",
        author: latestCommit.commit?.author?.name || "",
        date: latestCommit.commit?.author?.date || "",
        url: latestCommit.html_url,
      })
    }

    const commit = await commitResponse.json()

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
    console.error("[v0] Error fetching latest commit:", error)
    return NextResponse.json({ error: "Failed to fetch latest commit" }, { status: 500 })
  }
}

