import { NextResponse } from "next/server"
import { getCustomFields, createCustomField } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const fields = await getCustomFields(id)
    return NextResponse.json(fields)
  } catch (error) {
    console.error("[v0] Error fetching custom fields:", error)
    return NextResponse.json({ error: "Failed to fetch custom fields" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const field = await createCustomField({
      ...body,
      projectId: id,
    })
    return NextResponse.json(field)
  } catch (error) {
    console.error("[v0] Error creating custom field:", error)
    return NextResponse.json({ error: "Failed to create custom field" }, { status: 500 })
  }
}

