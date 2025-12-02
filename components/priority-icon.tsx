import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import type { IssuePriority } from "@/lib/types"

interface PriorityIconProps {
  priority: IssuePriority
  className?: string
}

export function PriorityIcon({ priority, className = "h-4 w-4" }: PriorityIconProps) {
  switch (priority) {
    case "highest":
      return <ArrowUp className={`${className} text-red-600`} />
    case "high":
      return <ArrowUp className={`${className} text-orange-600`} />
    case "medium":
      return <Minus className={`${className} text-yellow-600`} />
    case "low":
      return <ArrowDown className={`${className} text-blue-600`} />
    case "lowest":
      return <ArrowDown className={`${className} text-gray-600`} />
  }
}
