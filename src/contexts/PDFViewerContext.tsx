import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PDFViewerContextType {
  isOpen: boolean
  pdfUrl: string
  documentName: string
  page?: string
  openPDF: (url: string, name: string, page?: string) => void
  closePDF: () => void
}

export const PDFViewerContext = createContext<PDFViewerContextType | undefined>(
  undefined
)

interface PDFViewerProviderProps {
  children: ReactNode
}

export function PDFViewerProvider({ children }: PDFViewerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [page, setPage] = useState<string | undefined>()

  const openPDF = (url: string, name: string, targetPage?: string) => {
    setPdfUrl(url)
    setDocumentName(name)
    setPage(targetPage)
    setIsOpen(true)
  }

  const closePDF = () => {
    setIsOpen(false)
    // Limpiar después de la animación de cierre
    setTimeout(() => {
      setPdfUrl('')
      setDocumentName('')
      setPage(undefined)
    }, 300)
  }

  return (
    <PDFViewerContext.Provider
      value={{
        isOpen,
        pdfUrl,
        documentName,
        page,
        openPDF,
        closePDF,
      }}
    >
      {children}
    </PDFViewerContext.Provider>
  )
}
