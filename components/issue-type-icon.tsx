import { Bug, CheckSquare, BookOpen, Layers } from "lucide-react"
import type { IssueType } from "@/lib/types"

interface IssueTypeIconProps {
  type: IssueType
  className?: string
}

export function IssueTypeIcon({ type, className = "h-4 w-4" }: IssueTypeIconProps) {
  switch (type) {
    case "bug":
      return <Bug className={className} />
    case "task":
      return <CheckSquare className={className} />
    case "story":
      return <BookOpen className={className} />
    case "epic":
      return <Layers className={className} />
  }
}
