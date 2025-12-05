import { NextResponse } from "next/server"
import { deleteSavedFilter } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    await deleteSavedFilter(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting saved filter:", error)
    return NextResponse.json({ error: "Failed to delete saved filter" }, { status: 500 })
  }
}

