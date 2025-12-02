import { notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { ProjectHeader } from "@/components/project-header"
import { getProject, getIssuesByProject } from "@/lib/db"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  const issues = await getIssuesByProject(project.id)

  return (
    <div className="min-h-screen bg-muted/30">
      <ProjectHeader project={project} />
      <main className="container mx-auto px-6 py-6">
        <KanbanBoard project={project} initialIssues={issues} />
      </main>
    </div>
  )
}
