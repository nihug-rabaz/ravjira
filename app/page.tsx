import Link from "next/link"
import { getProjects } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Folder } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserMenu } from "@/components/user-menu"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
                  <Folder className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-primary">RavJira</h1>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <CreateProjectDialog />
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 rounded">
                      <AvatarImage src={project.avatar || "/placeholder.svg"} alt={project.name} />
                      <AvatarFallback className="rounded bg-primary text-primary-foreground">
                        {project.key}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">{project.key}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {project.members.length} {project.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Folder className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Get started by creating your first project</p>
            <CreateProjectDialog />
          </div>
        )}
      </main>
    </div>
  )
}
