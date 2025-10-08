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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)

  // Reset loading state when PDF URL changes
  React.useEffect(() => {
    setIsIframeLoaded(false)
  }, [pdfUrl])

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

  // Función para construir URL del iframe con página específica
  const getIframeUrl = (url: string, targetPage?: string) => {
    if (isGoogleDriveUrl(url)) {
      const embedUrl = getGoogleDriveEmbedUrl(url)
      // Google Drive no soporta fragmentos de página directamente en embed
      return embedUrl
    }

    if (isSupabaseUrl(url) && targetPage) {
      // Para Supabase, agregar fragmento de página al final de la URL
      const pageNumber = parseInt(targetPage)
      if (pageNumber && pageNumber > 0) {
        return `${url}#page=${pageNumber}`
      }
    }

    return url
  }

  // URL para el visor de PDF (react-pdf-viewer)
  const getPDFViewerUrl = (url: string) => {
    console.log('Original PDF URL:', url)
    if (isGoogleDriveUrl(url)) {
      return convertGoogleDriveUrl(url)
    }
    // Para otros servicios, usar URL directa
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
        <DialogTitle className="sr-only">{documentName}</DialogTitle>
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
            {isGoogleDriveUrl(pdfUrl) || isSupabaseUrl(pdfUrl) ? (
              /* Usar iframe para Google Drive y Supabase */
              <div className="w-full h-full relative">
                <iframe
                  src={getIframeUrl(pdfUrl, page)}
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
                  onError={(e) => {
                    console.error('Error loading PDF in iframe:', e)
                    setIsIframeLoaded(true) // Ocultar loading aunque haya error
                  }}
                  onLoad={() => {
                    console.log('PDF iframe loaded successfully')
                    if (page) {
                      console.log(`PDF opened at page ${page}`)
                    }
                    setIsIframeLoaded(true)
                  }}
                />
                {/* Mensaje de carga */}
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banking-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">
                        Cargando PDF...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Usar react-pdf-viewer solo para S3 y otros servicios */
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div
                  style={{
                    height: '100%',
                  }}
                >
                  <Viewer
                    fileUrl={getPDFViewerUrl(pdfUrl)}
                    plugins={[defaultLayoutPluginInstance]}
                    onDocumentLoad={(e) => {
                      console.log(
                        'PDF loaded successfully:',
                        e.doc.numPages,
                        'pages'
                      )
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
                    renderError={(error) => (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Error al cargar el PDF
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          No se pudo cargar el documento. Intenta descargarlo o
                          abrirlo en una nueva pestaña.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDownload}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                          <Button
                            onClick={handleMaximize}
                            variant="outline"
                            size="sm"
                          >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Abrir en nueva pestaña
                          </Button>
                        </div>
                      </div>
                    )}
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
