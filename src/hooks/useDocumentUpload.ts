import { useState } from 'react'
import { uploadDocument } from '@/services/documents'
import type {
  DocumentFormData,
  UploadProgress,
  UPLOAD_STEPS,
} from '@/services/documents/types'
import { useToast } from '@/hooks/use-toast'
import confetti from 'canvas-confetti'

// Filter entities type (should match the one in documentsApi.ts)
interface FilterEntity {
  id: number
  name: string
}

interface FilterEntities {
  areas?: FilterEntity[]
  categories?: FilterEntity[]
  sources?: FilterEntity[]
  tags?: FilterEntity[]
}

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    step: 0,
    message: '',
    progress: 0,
  })
  const [step5Timer, setStep5Timer] = useState<NodeJS.Timeout | null>(null)
  const [step5Progress, setStep5Progress] = useState(50)
  const [step5SubStep, setStep5SubStep] = useState(0)
  const { toast } = useToast()

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  // Sub-steps for Step 5 (LexiMind Memory processing)
  const step5SubSteps = [
    { icon: '🔍', message: 'Extrayendo texto del PDF...' },
    { icon: '🧠', message: 'Procesando documento (chunking y embeddings)...' },
    { icon: '⚡', message: 'Preparando vectores para Pinecone...' },
    { icon: '💾', message: 'Guardando en Pinecone...' },
  ]

  const startStep5Carousel = () => {
    // Show initial warning message
    setUploadProgress({
      step: 5,
      message: '🚀 Estamos en el último paso. ¡Ánimo!',
      progress: 50,
    })

    // Start carousel after 2 seconds
    setTimeout(() => {
      startCarouselLoop()
    }, 2000)
  }

  const startCarouselLoop = () => {
    let currentProgress = 50
    let currentSubStep = 0

    const timer = setInterval(() => {
      currentSubStep = (currentSubStep + 1) % step5SubSteps.length

      // If we completed a full cycle (back to step 0), increase progress by 5%
      if (currentSubStep === 0) {
        currentProgress = Math.min(currentProgress + 5, 95) // Max 95% during carousel
        setStep5Progress(currentProgress)
      }

      // Update progress with current sub-step
      const subStepData = step5SubSteps[currentSubStep]
      setUploadProgress({
        step: 5,
        message: `${subStepData.icon} ${subStepData.message}`,
        progress: currentProgress,
      })

      setStep5SubStep(currentSubStep)
    }, 5000) // Every 5 seconds

    setStep5Timer(timer)
  }

  const stopStep5Carousel = () => {
    if (step5Timer) {
      clearInterval(step5Timer)
      setStep5Timer(null)
    }
    // Reset step 5 state
    setStep5Progress(50)
    setStep5SubStep(0)
  }

  const handleUpload = async (
    formData: DocumentFormData,
    filterEntities: FilterEntities
  ) => {
    setIsUploading(true)

    try {
      const result = await uploadDocument(formData, filterEntities, (step) => {
        const stepData = {
          1: { step: 1, message: 'Uploading Document...', progress: 10 },
          2: { step: 2, message: 'Document Sent...', progress: 20 },
          3: { step: 3, message: 'Generating Embeddings...', progress: 30 },
          4: { step: 4, message: 'Saving to Database...', progress: 50 },
        }[step]

        if (stepData) {
          setUploadProgress(stepData)
        } else if (step === 5) {
          // Start the carousel for step 5
          startStep5Carousel()
        }
      })

      if (result.success) {
        // Stop carousel and show completion
        stopStep5Carousel()
        setUploadProgress({
          step: 5,
          message: '✅ LexiMind Memory procesado exitosamente!',
          progress: 100,
        })

        // Wait a moment before confetti
        setTimeout(() => {
          triggerConfetti()
        }, 500)

        // Show success toast
        toast({
          title: 'Document uploaded successfully 🎉',
          description: `${formData.alias} has been uploaded to your library.`,
        })

        // Show warning if LexiMind Memory failed
        if (result.lexiMindWarning) {
          stopStep5Carousel()
          toast({
            title: '⚠️ LexiMind Memory Warning',
            description: `Document saved successfully, but LexiMind Memory step failed: ${result.lexiMindWarning}`,
            variant: 'destructive',
          })
        }

        return { success: true, document: result.document }
      } else {
        toast({
          title: 'Upload failed',
          description: result.error || 'An error occurred during upload.',
          variant: 'destructive',
        })

        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      })

      return { success: false, error: errorMessage }
    } finally {
      stopStep5Carousel()
      setIsUploading(false)
      setUploadProgress({ step: 0, message: '', progress: 0 })
    }
  }

  return {
    isUploading,
    uploadProgress,
    handleUpload,
  }
}
