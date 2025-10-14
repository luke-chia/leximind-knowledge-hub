import { useState } from 'react'
import { Brain, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { OpinionsApi } from '@/services/opinions'

interface AddOpinionDrawerProps {
  messageId: string
  onOpinionAdded?: () => void
}

export function AddOpinionDrawer({
  messageId,
  onOpinionAdded,
}: AddOpinionDrawerProps) {
  const [open, setOpen] = useState(false)
  const [opinionText, setOpinionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleSubmit = async () => {
    if (!opinionText.trim()) {
      toast({
        title: t('opinion.required'),
        description: t('opinion.required_description'),
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
        title: t('opinion.success'),
        description: t('opinion.success_description'),
      })

      setOpinionText('')
      setOpen(false)
      onOpinionAdded?.()
    } catch (error) {
      console.error('Error submitting opinion:', error)
      toast({
        title: t('opinion.error'),
        description: t('opinion.error_description'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-banking-primary/10 group relative"
          title={t('opinion.add_tooltip')}
        >
          <Brain className="h-4 w-4 group-hover:text-banking-primary transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {t('opinion.add_tooltip')}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[480px] sm:w-[650px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-banking-primary" />
            {t('opinion.title')}
          </SheetTitle>
          <SheetDescription className="text-left">
            {t('opinion.description')}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Textarea
            placeholder={t('opinion.placeholder')}
            value={opinionText}
            onChange={(e) => setOpinionText(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>
        <div className="mt-6 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !opinionText.trim()}
            className="w-full btn-banking-primary"
          >
            {isSubmitting ? t('opinion.submitting') : t('opinion.submit')}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {t('opinion.cancel')}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
