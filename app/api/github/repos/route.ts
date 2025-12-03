import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token") || process.env.GITHUB_TOKEN

    if (!token) {
      return NextResponse.json({ error: "GitHub token is required" }, { status: 400 })
    }

    const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
      ? `token ${token}`
      : `Bearer ${token}`

    const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        "Authorization": authHeader,
        "Accept": "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status })
    }

    const repos = await response.json()

    return NextResponse.json(
      repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        private: repo.private,
        owner: repo.owner.login,
      }))
    )
  } catch (error) {
    console.error("[v0] Error fetching GitHub repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, private: isPrivate, token } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 })
    }

    const authToken = token || process.env.GITHUB_TOKEN
    if (!authToken) {
      return NextResponse.json({ error: "GitHub token is required" }, { status: 400 })
    }

    const authHeader = authToken.startsWith("ghp_") || authToken.startsWith("github_pat_")
      ? `token ${authToken}`
      : `Bearer ${authToken}`

    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || "",
        private: isPrivate || false,
        auto_init: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to create repository" }, { status: response.status })
    }

    const repo = await response.json()

    return NextResponse.json({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      private: repo.private,
      owner: repo.owner.login,
    })
  } catch (error) {
    console.error("[v0] Error creating GitHub repository:", error)
    return NextResponse.json({ error: "Failed to create repository" }, { status: 500 })
  }
}

