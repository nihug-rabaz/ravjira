import { NextResponse } from "next/server"
import { getReleasesByProject, createRelease } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const releases = await getReleasesByProject(id)
    return NextResponse.json(releases)
  } catch (error) {
    console.error("[v0] Error fetching releases:", error)
    return NextResponse.json({ error: "Failed to fetch releases" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const release = await createRelease({
      ...body,
      projectId: id,
    })
    return NextResponse.json(release)
  } catch (error) {
    console.error("[v0] Error creating release:", error)
    return NextResponse.json({ error: "Failed to create release" }, { status: 500 })
  }
}

