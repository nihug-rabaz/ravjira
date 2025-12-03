import { NextResponse } from "next/server"
import { getProjectMembers } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const members = await getProjectMembers(id)
    return NextResponse.json(members)
  } catch (error) {
    console.error("[v0] Error fetching project members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

