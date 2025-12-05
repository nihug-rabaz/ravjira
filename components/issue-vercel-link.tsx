"use client"

import { useState } from "react"
import type { Issue, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, ExternalLink, Plus } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { VercelIntegrationDialog } from "@/components/vercel-integration-dialog"

interface IssueVercelLinkProps {
  issue: Issue
  project: Project
}

export function IssueVercelLink({ issue, project }: IssueVercelLinkProps) {
  const { t } = useLanguage()
  const [selectedVercelId, setSelectedVercelId] = useState<string>(issue.vercelProjectId || "")
  const [openVercelDialog, setOpenVercelDialog] = useState(false)

  const selectedVercel = project.vercelProjects?.find(vp => vp.id === selectedVercelId)

  const handleVercelChange = async (vercelId: string) => {
    setSelectedVercelId(vercelId)
    if (vercelId) {
      try {
        const res = await fetch(`/api/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vercelProjectId: vercelId }),
        })
        if (res.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error("[v0] Error linking Vercel project:", error)
      }
    }
  }

  const hasVercelProjects = project.vercelProjects && project.vercelProjects.length > 0

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Vercel Deployment
          </h3>
          {hasVercelProjects && project.vercelProjects && (
            <Select value={selectedVercelId || ""} onValueChange={handleVercelChange}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Select Deployment" />
              </SelectTrigger>
              <SelectContent>
                {project.vercelProjects.map((vp) => (
                  <SelectItem key={vp.id} value={vp.id}>
                    {vp.vercelProjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!hasVercelProjects && (
          <div className="p-3 bg-muted rounded text-sm">
            <p className="text-muted-foreground mb-2">
              Connect a Vercel project to see deployment links.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenVercelDialog(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Connect Vercel Project
            </Button>
          </div>
        )}

        {hasVercelProjects && selectedVercel && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{selectedVercel.vercelProjectName}</span>
              {selectedVercel.vercelUrl && (
                <a
                  href={selectedVercel.vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Deployment
                </a>
              )}
            </div>
            {selectedVercel.vercelUrl && (
              <div className="p-2 bg-muted rounded text-xs">
                <a
                  href={selectedVercel.vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {selectedVercel.vercelUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {hasVercelProjects && !selectedVercel && project.vercelProjects && project.vercelProjects.length === 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{project.vercelProjects[0].vercelProjectName}</span>
              {project.vercelProjects[0].vercelUrl && (
                <a
                  href={project.vercelProjects[0].vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Deployment
                </a>
              )}
            </div>
            {project.vercelProjects[0].vercelUrl && (
              <div className="p-2 bg-muted rounded text-xs">
                <a
                  href={project.vercelProjects[0].vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {project.vercelProjects[0].vercelUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {hasVercelProjects && !selectedVercel && project.vercelProjects && project.vercelProjects.length > 1 && (
          <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
            No Vercel deployment linked. Select one from the dropdown above.
          </div>
        )}
      </div>

      <VercelIntegrationDialog 
        project={project} 
        open={openVercelDialog} 
        onOpenChange={(open) => {
          setOpenVercelDialog(open)
          if (!open) {
            // Reload page to get updated project with new Vercel projects
            window.location.reload()
          }
        }} 
      />
    </Card>
  )
}

