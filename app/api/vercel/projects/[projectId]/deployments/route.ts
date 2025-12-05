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

    // Get all deployments
    const deploymentsUrl = teamId
      ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=20`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=20`

    const deploymentsRes = await fetch(deploymentsUrl, { headers })
    
    let deployments: any[] = []
    if (deploymentsRes.ok) {
      const deploymentsData = await deploymentsRes.json()
      deployments = deploymentsData.deployments || []
    }

    // Get domains for the project - use v9 projects endpoint which includes domains
    let domains: string[] = []
    if (project.domains && Array.isArray(project.domains)) {
      domains = project.domains
    } else if (project.link?.domain) {
      domains = [project.link.domain]
    }
    
    // Also try to get domains from the project configuration
    if (domains.length === 0) {
      const projectConfigUrl = teamId
        ? `https://api.vercel.com/v9/projects/${projectId}/domains?teamId=${teamId}`
        : `https://api.vercel.com/v9/projects/${projectId}/domains`
      
      const domainsRes = await fetch(projectConfigUrl, { headers })
      if (domainsRes.ok) {
        const domainsData = await domainsRes.json()
        if (domainsData.domains && Array.isArray(domainsData.domains)) {
          domains = domainsData.domains.map((d: any) => typeof d === 'string' ? d : d.name || d.domain).filter(Boolean)
        }
      }
    }

    // Format deployments with their URLs
    const formattedDeployments = deployments.map((deployment: any) => ({
      id: deployment.uid,
      url: deployment.url,
      state: deployment.state,
      createdAt: deployment.createdAt,
      alias: deployment.alias || [],
    }))

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        url: project.link?.url || `https://${project.name}.vercel.app`,
      },
      deployments: formattedDeployments,
      domains: domains,
    })
  } catch (error) {
    console.error("[v0] Error fetching Vercel deployments:", error)
    return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 })
  }
}

