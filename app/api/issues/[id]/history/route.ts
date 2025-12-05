import { NextResponse } from "next/server"
import { getIssueHistory } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const history = await getIssueHistory(id)
    return NextResponse.json(history)
  } catch (error) {
    console.error("[v0] Error fetching issue history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}



