import { NextResponse } from "next/server"
import { getIssueVotes, hasUserVoted, toggleVote } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const votes = await getIssueVotes(id)
    const user = await getCurrentUser()
    let userVoted = false
    if (user) {
      userVoted = await hasUserVoted(id, user.id)
    }
    return NextResponse.json({ votes, userVoted })
  } catch (error) {
    console.error("[v0] Error fetching votes:", error)
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const voted = await toggleVote(id, user.id)
    const votes = await getIssueVotes(id)
    return NextResponse.json({ votes, userVoted: voted })
  } catch (error) {
    console.error("[v0] Error toggling vote:", error)
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 })
  }
}

