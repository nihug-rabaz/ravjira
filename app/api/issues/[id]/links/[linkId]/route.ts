import { NextResponse } from "next/server"
import { deleteIssueLink } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  try {
    const { linkId } = await params
    await deleteIssueLink(linkId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting issue link:", error)
    return NextResponse.json({ error: "Failed to delete issue link" }, { status: 500 })
  }
}

