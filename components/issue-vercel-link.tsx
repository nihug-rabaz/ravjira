"use client"

import { useState } from "react"
import type { Issue, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, ExternalLink } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface IssueVercelLinkProps {
  issue: Issue
  project: Project
}

export function IssueVercelLink({ issue, project }: IssueVercelLinkProps) {
  const { t } = useLanguage()
  const [selectedVercelId, setSelectedVercelId] = useState<string>(issue.vercelProjectId || "")

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

  if (!project.vercelProjects || project.vercelProjects.length === 0) {
    return null
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Vercel Deployment
          </h3>
          {project.vercelProjects && project.vercelProjects.length > 1 && (
            <Select value={selectedVercelId} onValueChange={handleVercelChange}>
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

        {selectedVercel ? (
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
        ) : project.vercelProjects && project.vercelProjects.length === 1 ? (
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
        ) : (
          <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
            No Vercel deployment linked. Select one from the dropdown above.
          </div>
        )}
      </div>
    </Card>
  )
}

