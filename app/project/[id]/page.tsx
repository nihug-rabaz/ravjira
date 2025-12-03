import { notFound } from "next/navigation"
import { getProject, getIssuesByProject } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { ProjectPageClient } from "@/components/project-page-client"

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  const issues = await getIssuesByProject(project.id)
  const user = await getCurrentUser()

  return <ProjectPageClient project={project} issues={issues} user={user} />
}
