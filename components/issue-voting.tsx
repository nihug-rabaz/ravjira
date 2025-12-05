"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"

interface IssueVotingProps {
  issueId: string
}

export function IssueVoting({ issueId }: IssueVotingProps) {
  const [votes, setVotes] = useState(0)
  const [userVoted, setUserVoted] = useState(false)

  useEffect(() => {
    fetchVotes()
  }, [issueId])

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/votes`)
      const data = await res.json()
      setVotes(data.votes)
      setUserVoted(data.userVoted)
    } catch (error) {
      console.error("[v0] Error fetching votes:", error)
    }
  }

  const handleVote = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/votes`, { method: "POST" })
      const data = await res.json()
      setVotes(data.votes)
      setUserVoted(data.userVoted)
    } catch (error) {
      console.error("[v0] Error voting:", error)
    }
  }

  return (
    <Button variant={userVoted ? "default" : "outline"} size="sm" onClick={handleVote}>
      <ThumbsUp className={`h-4 w-4 mr-1 ${userVoted ? "fill-current" : ""}`} />
      {votes}
    </Button>
  )
}

