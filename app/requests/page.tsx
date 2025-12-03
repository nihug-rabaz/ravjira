import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RequestsList } from "@/components/requests-list"

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">בקשות חדשות</h1>
        <p className="text-sm text-muted-foreground">
          בקשות לפיתוח אתרים ותוכנות שממתינות לטיפול
        </p>
      </div>
      <RequestsList />
    </div>
  )
}

