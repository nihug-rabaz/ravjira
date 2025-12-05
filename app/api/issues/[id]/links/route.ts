import { NextResponse } from "next/server"
import { getIssueLinks, createIssueLink } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const links = await getIssueLinks(id)
    return NextResponse.json(links)
  } catch (error) {
    console.error("[v0] Error fetching issue links:", error)
    return NextResponse.json({ error: "Failed to fetch issue links" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { targetIssueId, linkType } = await request.json()
    const link = await createIssueLink({
      sourceIssueId: id,
      targetIssueId,
      linkType,
    })
    return NextResponse.json(link)
  } catch (error) {
    console.error("[v0] Error creating issue link:", error)
    return NextResponse.json({ error: "Failed to create issue link" }, { status: 500 })
  }
}

