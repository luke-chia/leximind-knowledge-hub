import { useContext } from 'react'
import { PDFViewerContext } from '@/contexts/PDFViewerContext'

export function usePDFViewer() {
  const context = useContext(PDFViewerContext)
  if (context === undefined) {
    throw new Error('usePDFViewer must be used within a PDFViewerProvider')
  }
  return context
}
