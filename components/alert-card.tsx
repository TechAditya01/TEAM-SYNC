"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Share2, MessageCircle, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface AlertCardProps {
  alert: any
  onClick?: () => void
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const [upvotes, setUpvotes] = useState(alert.upvotes || 0)
  const [downvotes, setDownvotes] = useState(alert.downvotes || 0)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const severityColors = {
    low: "bg-blue-500 hover:bg-blue-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    high: "bg-orange-500 hover:bg-orange-600",
    critical: "bg-red-500 hover:bg-red-600",
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Please log in to vote')
        return
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('user_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('alert_id', alert.id)
        .single()

      let newVote = userVote === voteType ? null : voteType

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('user_votes')
            .delete()
            .eq('id', existingVote.id)
          newVote = null
        } else {
          // Change vote
          await supabase
            .from('user_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else if (newVote) {
        // Add new vote
        await supabase
          .from('user_votes')
          .insert({
            user_id: user.id,
            alert_id: alert.id,
            vote_type: voteType
          })
      }

      setUserVote(newVote)
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: alert.title,
      text: `Check out this alert: ${alert.title}`,
      url: `${window.location.origin}/alert/${alert.id}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    const url = `${window.location.origin}/alert/${alert.id}`
    navigator.clipboard.writeText(url).then(() => {
      alert('Alert link copied to clipboard!')
    })
  }

  const loadComments = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('alert_comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('alert_id', alert.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Please log in to comment')
        return
      }

      const { error } = await supabase
        .from('alert_comments')
        .insert({
          alert_id: alert.id,
          user_id: user.id,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      loadComments() // Reload comments
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
    if (!showComments) {
      loadComments()
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
        severityColors[alert.severity as keyof typeof severityColors] || 'border-gray-300'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Alert: ${alert.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={alert.status === 'verified' ? 'default' : 'secondary'}>
                {alert.status === 'verified' ? 'Verified' : 'Pending'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {alert.severity}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg leading-tight">{alert.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{alert.location_name || `${alert.latitude?.toFixed(4)}, ${alert.longitude?.toFixed(4)}`}</span>
          </div>
          <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleVote('up')
              }}
              className={`flex items-center gap-1 ${userVote === 'up' ? 'text-green-600' : ''}`}
              aria-label="Upvote this alert"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{upvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleVote('down')
              }}
              className={`flex items-center gap-1 ${userVote === 'down' ? 'text-red-600' : ''}`}
              aria-label="Downvote this alert"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{downvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleComments()
              }}
              className="flex items-center gap-1"
              aria-label="Toggle comments"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            aria-label="Share this alert"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>
                      {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmittingComment || !newComment.trim()}
                size="sm"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
