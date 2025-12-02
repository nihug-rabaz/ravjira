import { notFound } from "next/navigation"
import { IssueDetail } from "@/components/issue-detail"
import { getIssue, getProject } from "@/lib/db"

export default async function IssuePage({ params }: { params: { id: string } }) {
  const { id } = params
  const issue = await getIssue(id)

  if (!issue) {
    notFound()
  }

  const project = await getProject(issue.projectId)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <IssueDetail issue={issue} project={project} />
    </div>
  )
}
