import { useState } from 'react'
import { uploadDocument } from '@/services/documents'
import type { DocumentFormData, UploadProgress, UPLOAD_STEPS } from '@/services/documents/types'
import { useToast } from '@/hooks/use-toast'
import confetti from 'canvas-confetti'

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    step: 0,
    message: '',
    progress: 0
  })
  const { toast } = useToast()

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleUpload = async (formData: DocumentFormData) => {
    setIsUploading(true)
    
    try {
      const result = await uploadDocument(formData, (step) => {
        const stepData = {
          1: { step: 1, message: "Uploading Document...", progress: 20 },
          2: { step: 2, message: "Document Sent...", progress: 40 },
          3: { step: 3, message: "Generating Embeddings...", progress: 60 },
          4: { step: 4, message: "Saving to Database...", progress: 80 },
          5: { step: 5, message: "Saving to LexiMind Memory...", progress: 100 },
        }[step]
        
        if (stepData) {
          setUploadProgress(stepData)
        }
      })

      if (result.success) {
        // Trigger confetti animation
        triggerConfetti()
        
        toast({
          title: "Document uploaded successfully 🎉",
          description: `${formData.alias} has been uploaded to your library.`,
        })
        
        return { success: true, document: result.document }
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "An error occurred during upload.",
          variant: "destructive",
        })
        
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setIsUploading(false)
      setUploadProgress({ step: 0, message: '', progress: 0 })
    }
  }

  return {
    isUploading,
    uploadProgress,
    handleUpload
  }
}