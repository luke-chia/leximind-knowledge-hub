import { useState, useEffect } from 'react'
import { MessageCircle, ThumbsUp, ThumbsDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { OpinionsApi, ExpertOpinion } from '@/services/opinions'

interface ViewOpinionsModalProps {
  messageId: string
  opinionCount: number
  onCountChange?: (count: number) => void
}

export function ViewOpinionsModal({ messageId, opinionCount, onCountChange }: ViewOpinionsModalProps) {
  const [open, setOpen] = useState(false)
  const [opinions, setOpinions] = useState<ExpertOpinion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadOpinions()
    }
  }, [open, messageId])

  const loadOpinions = async () => {
    setIsLoading(true)
    try {
      const data = await OpinionsApi.getOpinionsByMessage(messageId)
      setOpinions(data)
      onCountChange?.(data.length)
      
      // Initialize ratings
      const ratings: Record<string, number> = {}
      data.forEach(opinion => {
        if (opinion.rating) {
          ratings[opinion.id] = opinion.rating
        }
      })
      setSelectedRatings(ratings)
    } catch (error) {
      console.error('Error loading opinions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load opinions.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (opinionId: string, rating: number) => {
    try {
      await OpinionsApi.rateOpinion({ opinion_id: opinionId, rating })
      setSelectedRatings(prev => ({ ...prev, [opinionId]: rating }))
      toast({
        title: 'Rating saved',
        description: 'Thank you for rating this opinion.',
      })
    } catch (error) {
      console.error('Error rating opinion:', error)
      toast({
        title: 'Error',
        description: 'Failed to save rating.',
        variant: 'destructive',
      })
    }
  }

  const handleVote = async (opinionId: string, isHelpful: boolean) => {
    try {
      await OpinionsApi.voteOpinion({ opinion_id: opinionId, is_helpful: isHelpful })
      await loadOpinions() // Reload to get updated counts
      toast({
        title: 'Vote recorded',
        description: 'Thank you for your feedback.',
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Error',
        description: 'Failed to record vote.',
        variant: 'destructive',
      })
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 hover:bg-banking-primary/10 group relative"
          title="View Expert Opinions"
        >
          <MessageCircle className="h-4 w-4 mr-1 group-hover:text-banking-primary transition-colors" />
          {opinionCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] px-1">
              {opinionCount}
            </Badge>
          )}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            View Expert Opinions
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-banking-primary" />
            Expert Opinions ({opinions.length})
          </DialogTitle>
          <DialogDescription>
            View insights and analysis from domain experts
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading opinions...</div>
            </div>
          ) : opinions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No expert opinions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Be the first to share your insights
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {opinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className="p-4 rounded-lg border border-border bg-card hover:border-banking-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={opinion.expert_avatar} />
                      <AvatarFallback className="bg-banking-primary/20 text-banking-primary">
                        {getInitials(opinion.expert_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{opinion.expert_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(opinion.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {opinion.opinion_text}
                      </p>
                      
                      {/* Rating Section */}
                      <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Rate this opinion:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(opinion.id, star)}
                                className="transition-colors hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    (selectedRatings[opinion.id] || 0) >= star
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Helpful Section */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(opinion.id, true)}
                            className="h-7 px-2 hover:bg-banking-primary/10"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            <span className="text-xs">{opinion.helpful_votes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(opinion.id, false)}
                            className="h-7 px-2 hover:bg-destructive/10"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            <span className="text-xs">{opinion.unhelpful_votes}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
