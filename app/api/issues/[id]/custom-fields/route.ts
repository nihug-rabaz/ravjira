import { NextResponse } from "next/server"
import { getIssueCustomFieldValues, setIssueCustomFieldValue } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const values = await getIssueCustomFieldValues(id)
    return NextResponse.json(values)
  } catch (error) {
    console.error("[v0] Error fetching custom field values:", error)
    return NextResponse.json({ error: "Failed to fetch custom field values" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { customFieldId, value } = await request.json()
    await setIssueCustomFieldValue(id, customFieldId, value)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error setting custom field value:", error)
    return NextResponse.json({ error: "Failed to set custom field value" }, { status: 500 })
  }
}

