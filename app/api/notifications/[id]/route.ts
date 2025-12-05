import { NextResponse } from "next/server"
import { markNotificationAsRead } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await markNotificationAsRead(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}



