import { NextResponse } from "next/server"
import { getLabelsByIssue, addLabelToIssue, removeLabelFromIssue } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const labels = await getLabelsByIssue(id)
    return NextResponse.json(labels)
  } catch (error) {
    console.error("[v0] Error fetching issue labels:", error)
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { labelId } = await request.json()

    if (!labelId) {
      return NextResponse.json({ error: "Label ID is required" }, { status: 400 })
    }

    await addLabelToIssue(id, labelId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding label to issue:", error)
    return NextResponse.json({ error: "Failed to add label" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const labelId = searchParams.get("labelId")

    if (!labelId) {
      return NextResponse.json({ error: "Label ID is required" }, { status: 400 })
    }

    await removeLabelFromIssue(id, labelId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing label from issue:", error)
    return NextResponse.json({ error: "Failed to remove label" }, { status: 500 })
  }
}



