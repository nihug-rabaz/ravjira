import Link from "next/link"
import type { Project } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { ChevronLeft, Users, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserMenu } from "@/components/user-menu"
import { ProjectSettingsMenu } from "@/components/project-settings-menu"

interface ProjectHeaderProps {
  project: Project
}

export async function ProjectHeader({ project }: ProjectHeaderProps) {
  const user = await getCurrentUser()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                  <Folder className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-primary">RavJira</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Avatar className="h-8 w-8 rounded">
              <AvatarImage src={project.avatar || "/placeholder.svg"} alt={project.name} />
              <AvatarFallback className="rounded bg-primary text-primary-foreground text-xs">
                {project.key}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">{project.key}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
            <ProjectSettingsMenu project={project} />
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
