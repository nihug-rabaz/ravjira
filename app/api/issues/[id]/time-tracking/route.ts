import { NextResponse } from "next/server"
import { getTimeLogsByIssue, createTimeLog, getIssueEstimate, updateIssueEstimate } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const logs = await getTimeLogsByIssue(id)
    const estimate = await getIssueEstimate(id)
    
    return NextResponse.json({ logs, estimate })
  } catch (error) {
    console.error("[v0] Error fetching time tracking:", error)
    return NextResponse.json({ error: "Failed to fetch time tracking" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { timeSpent, description, loggedAt } = body

    if (!timeSpent || timeSpent <= 0) {
      return NextResponse.json({ error: "Time spent is required" }, { status: 400 })
    }

    const log = await createTimeLog({
      issueId: id,
      userId: user.id,
      timeSpent,
      description,
      loggedAt,
    })

    const estimate = await getIssueEstimate(id)
    if (estimate) {
      await updateIssueEstimate(id, {
        timeSpent: (estimate.timeSpent || 0) + timeSpent,
        remainingEstimate: estimate.remainingEstimate ? Math.max(0, estimate.remainingEstimate - timeSpent) : undefined,
      })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("[v0] Error logging time:", error)
    return NextResponse.json({ error: "Failed to log time" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { originalEstimate, remainingEstimate } = await request.json()

    const estimate = await updateIssueEstimate(id, {
      originalEstimate,
      remainingEstimate,
    })

    return NextResponse.json(estimate)
  } catch (error) {
    console.error("[v0] Error updating estimate:", error)
    return NextResponse.json({ error: "Failed to update estimate" }, { status: 500 })
  }
}

