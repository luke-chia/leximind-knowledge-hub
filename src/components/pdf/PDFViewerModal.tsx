import React, { useState } from 'react'
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

// Importaciones de react-pdf-viewer
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  documentName: string
  page?: string
}

export function PDFViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  documentName,
  page,
}: PDFViewerModalProps) {
  const { t } = useTranslation()
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Detectar tipo de URL
  const isGoogleDriveUrl = (url: string) => url.includes('drive.google.com')
  const isSupabaseUrl = (url: string) => url.includes('supabase.co/storage')
  const isS3Url = (url: string) =>
    url.includes('s3.amazonaws.com') || url.includes('amazonaws.com')

  // Convertir URL de Google Drive para diferentes propósitos
  const convertGoogleDriveUrl = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        // Para react-pdf-viewer necesitamos URL directa
        return `https://drive.google.com/uc?export=download&id=${fileId}`
      }
    }
    return url
  }

  // URL para iframe (solo Google Drive)
  const getGoogleDriveEmbedUrl = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    return url
  }

  // URL para descarga
  const getDownloadUrl = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      return convertGoogleDriveUrl(url)
    }
    // Para Supabase y S3, la URL ya es directa
    return url
  }

  // URL para el visor de PDF
  const getPDFViewerUrl = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      return convertGoogleDriveUrl(url)
    }
    // Para Supabase y S3, usar URL directa
    return url
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = getDownloadUrl(pdfUrl)
    link.download = documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMaximize = () => {
    window.open(pdfUrl, '_blank')
  }

  // Plugin de layout por defecto
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]], // Solo mostrar miniaturas
    toolbarPlugin: {
      searchPlugin: {
        keyword: '',
      },
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <div className="flex flex-col h-full">
          {/* Header con controles */}
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-banking-primary" />
              <div>
                <h3 className="font-semibold text-lg">{documentName}</h3>
                {page && (
                  <p className="text-sm text-muted-foreground">Página {page}</p>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              {/* Info de páginas */}
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                <Info className="h-4 w-4" />
                <span className="text-sm">
                  {currentPage} / {totalPages || '?'}
                </span>
              </div>

              {/* Zoom Out */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title={t('actions.pdf_viewer.zoom_out')}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              {/* Escala actual */}
              <span className="text-sm font-medium min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>

              {/* Zoom In */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                title={t('actions.pdf_viewer.zoom_in')}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Descargar */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title={t('actions.pdf_viewer.download')}
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Maximizar en nueva pestaña */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaximize}
                title={t('actions.pdf_viewer.maximize')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {/* Cerrar */}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                title={t('actions.pdf_viewer.close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenedor del PDF */}
          <div className="flex-1 overflow-hidden">
            {isGoogleDriveUrl(pdfUrl) ? (
              /* Usar iframe para Google Drive (temporal) */
              <div className="w-full h-full">
                <iframe
                  src={getGoogleDriveEmbedUrl(pdfUrl)}
                  className="w-full h-full border-0"
                  title={documentName}
                  loading="lazy"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${100 / scale}%`,
                    height: `${100 / scale}%`,
                  }}
                />
              </div>
            ) : (
              /* Usar react-pdf-viewer para Supabase/S3 y otros */
              <Worker workerUrl="/pdf.worker.min.js">
                <div
                  style={{
                    height: '100%',
                  }}
                >
                  <Viewer
                    fileUrl={getPDFViewerUrl(pdfUrl)}
                    plugins={[defaultLayoutPluginInstance]}
                    onDocumentLoad={(e) => {
                      setTotalPages(e.doc.numPages)
                      if (page) {
                        // Navegar a la página específica
                        setTimeout(() => {
                          const pageNumber = parseInt(page)
                          if (pageNumber && pageNumber <= e.doc.numPages) {
                            setCurrentPage(pageNumber)
                          }
                        }, 100)
                      }
                    }}
                    onPageChange={(e) => {
                      setCurrentPage(e.currentPage + 1)
                    }}
                  />
                </div>
              </Worker>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
