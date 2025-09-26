import React from 'react'
import { usePDFViewer } from '@/hooks/usePDFViewer'
import { PDFViewerModal } from './PDFViewerModal'

export function PDFViewerManager() {
  const { isOpen, pdfUrl, documentName, page, closePDF } = usePDFViewer()

  return (
    <PDFViewerModal
      isOpen={isOpen}
      onClose={closePDF}
      pdfUrl={pdfUrl}
      documentName={documentName}
      page={page}
    />
  )
}
