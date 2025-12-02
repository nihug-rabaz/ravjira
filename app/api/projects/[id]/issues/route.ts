import { NextResponse } from "next/server"
import { getIssuesByProject, createIssue } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const issues = await getIssuesByProject(id)
    return NextResponse.json(issues)
  } catch (error) {
    console.error("[v0] Error fetching issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const issue = await createIssue({
      ...body,
      projectId: id,
    })

    return NextResponse.json(issue)
  } catch (error) {
    console.error("[v0] Error creating issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
