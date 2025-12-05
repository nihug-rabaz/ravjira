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

    // Get domains for the project
    const domainsUrl = teamId
      ? `https://api.vercel.com/v5/domains?projectId=${projectId}&teamId=${teamId}`
      : `https://api.vercel.com/v5/domains?projectId=${projectId}`

    const domainsRes = await fetch(domainsUrl, { headers })
    
    let domains: string[] = []
    if (domainsRes.ok) {
      const domainsData = await domainsRes.json()
      domains = domainsData.domains?.map((d: any) => d.name) || []
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

