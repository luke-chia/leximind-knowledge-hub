import { useState } from 'react'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useToast } from '@/hooks/use-toast'
import { OpinionsApi } from '@/services/opinions'

interface AddOpinionDrawerProps {
  messageId: string
  onOpinionAdded?: () => void
}

export function AddOpinionDrawer({ messageId, onOpinionAdded }: AddOpinionDrawerProps) {
  const [open, setOpen] = useState(false)
  const [opinionText, setOpinionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!opinionText.trim()) {
      toast({
        title: 'Opinion required',
        description: 'Please write your expert opinion before submitting.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await OpinionsApi.createOpinion({
        message_id: messageId,
        opinion_text: opinionText,
      })

      toast({
        title: 'Opinion added successfully',
        description: 'Your expert opinion has been shared.',
      })

      setOpinionText('')
      setOpen(false)
      onOpinionAdded?.()
    } catch (error) {
      console.error('Error submitting opinion:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit opinion. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-banking-primary/10 group relative"
          title="Add Expert Opinion"
        >
          <Brain className="h-4 w-4 group-hover:text-banking-primary transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Add Expert Opinion
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-2xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-banking-primary" />
            Expert Opinion
          </DrawerTitle>
          <DrawerDescription>
            Share your expert analysis and insights on this response
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <Textarea
            placeholder="Write your expert opinion here... You can provide analysis, commentary, or additional context."
            value={opinionText}
            onChange={(e) => setOpinionText(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>
        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !opinionText.trim()}
            className="w-full btn-banking-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Opinion'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
