import { NextResponse } from "next/server"
import { getNotificationsByUser, markAllNotificationsAsRead } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const notifications = await getNotificationsByUser(user.id, unreadOnly)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await markAllNotificationsAsRead(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}


