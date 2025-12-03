"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{ issues: any[]; projects: any[] }>({ issues: [], projects: [] })
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ issues: [], projects: [] })
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Error searching:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
      setIsOpen(true)
    }
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            handleSearch(e.target.value)
            if (e.target.value.trim()) setIsOpen(true)
          }}
          className="pl-7 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base h-8 sm:h-10"
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() || results.issues.length > 0 || results.projects.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery("")
              setResults({ issues: [], projects: [] })
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>
          
          {query.trim() && (
            <div className="space-y-4">
              {results.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Issues ({results.issues.length})</h3>
                  <div className="space-y-2">
                    {results.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issue/${issue.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
                          <span className="text-sm font-medium">{issue.title}</span>
                        </div>
                        {issue.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{issue.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Projects ({results.projects.length})</h3>
                  <div className="space-y-2">
                    {results.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/project/${project.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
                          <span className="text-sm font-medium">{project.name}</span>
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.issues.length === 0 && results.projects.length === 0 && query.trim() && (
                <p className="text-sm text-muted-foreground text-center py-8">No results found</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

