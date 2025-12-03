import { NextResponse } from "next/server"
import { getAttachmentsByIssue, createAttachment, deleteAttachment } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const attachments = await getAttachmentsByIssue(id)
    return NextResponse.json(attachments)
  } catch (error) {
    console.error("[v0] Error fetching attachments:", error)
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await mkdir(UPLOAD_DIR, { recursive: true })

    const filename = `${Date.now()}-${file.name}`
    const filePath = join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    const attachment = await createAttachment({
      issueId: id,
      userId: user.id,
      filename: file.name,
      filePath: `/uploads/${filename}`,
      fileSize: file.size,
      mimeType: file.type,
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error("[v0] Error uploading attachment:", error)
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get("attachmentId")

    if (!attachmentId) {
      return NextResponse.json({ error: "Attachment ID is required" }, { status: 400 })
    }

    const attachments = await getAttachmentsByIssue(id)
    const attachment = attachments.find((a) => a.id === attachmentId)

    if (attachment) {
      try {
        const filePath = join(process.cwd(), "public", attachment.filePath)
        await unlink(filePath)
      } catch (error) {
        console.error("[v0] Error deleting file:", error)
      }
    }

    await deleteAttachment(attachmentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting attachment:", error)
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 })
  }
}

