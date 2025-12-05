import { NextResponse } from "next/server"
import { getWatchers, addWatcher, removeWatcher } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const watchers = await getWatchers(id)
    return NextResponse.json(watchers)
  } catch (error) {
    console.error("[v0] Error fetching watchers:", error)
    return NextResponse.json({ error: "Failed to fetch watchers" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId } = await request.json()
    await addWatcher(id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding watcher:", error)
    return NextResponse.json({ error: "Failed to add watcher" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }
    await removeWatcher(id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing watcher:", error)
    return NextResponse.json({ error: "Failed to remove watcher" }, { status: 500 })
  }
}

