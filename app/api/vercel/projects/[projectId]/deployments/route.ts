import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const token = process.env.VERCEL_TOKEN

    if (!token) {
      return NextResponse.json({ error: "Vercel token is required" }, { status: 400 })
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    // Get project details
    const projectUrl = teamId
      ? `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`
      : `https://api.vercel.com/v9/projects/${projectId}`

    const projectRes = await fetch(projectUrl, { headers })
    
    if (!projectRes.ok) {
      return NextResponse.json({ error: "Failed to fetch project" }, { status: projectRes.status })
    }

    const project = await projectRes.json()

    // Get latest deployment only
    const deploymentsUrl = teamId
      ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`

    const deploymentsRes = await fetch(deploymentsUrl, { headers })
    
    let latestDeployment: any = null
    if (deploymentsRes.ok) {
      const deploymentsData = await deploymentsRes.json()
      if (deploymentsData.deployments && deploymentsData.deployments.length > 0) {
        latestDeployment = deploymentsData.deployments[0]
      }
    }

    // Get domains from the latest deployment's alias (only custom domains, not vercel.app URLs)
    let domains: string[] = []
    if (latestDeployment && latestDeployment.alias && Array.isArray(latestDeployment.alias)) {
      // Filter out vercel.app URLs and keep only custom domains
      domains = latestDeployment.alias
        .filter((alias: string) => {
          // Exclude vercel.app preview URLs, keep only custom domains
          return !alias.includes('.vercel.app') && !alias.includes('vercel.app')
        })
        .filter(Boolean)
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        url: project.link?.url || `https://${project.name}.vercel.app`,
      },
      latestDeployment: latestDeployment ? {
        id: latestDeployment.uid,
        url: latestDeployment.url,
        state: latestDeployment.state,
        createdAt: latestDeployment.createdAt,
      } : null,
      domains: domains.length > 0 ? domains : null,
    })
  } catch (error) {
    console.error("[v0] Error fetching Vercel deployments:", error)
    return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 })
  }
}

