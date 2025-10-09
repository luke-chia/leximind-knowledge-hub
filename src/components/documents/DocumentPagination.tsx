import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DocumentPaginationProps {
  currentPage: number
  totalPages: number
  totalDocuments: number
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
}

export const DocumentPagination = ({
  currentPage,
  totalPages,
  totalDocuments,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: DocumentPaginationProps) => {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Máximo de páginas a mostrar

    if (totalPages <= showPages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Mostrar primeras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push(-1) // Elipsis
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Mostrar últimas páginas
        pages.push(1)
        pages.push(-1) // Elipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Mostrar páginas alrededor de la actual
        pages.push(1)
        pages.push(-1) // Elipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push(-2) // Elipsis
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const startItem = (currentPage - 1) * 9 + 1
  const endItem = Math.min(currentPage * 9, totalDocuments)

  return (
    <div className="flex items-center justify-between py-6">
      {/* Información de elementos */}
      <div className="text-sm text-muted-foreground">
        {t('documents.list.showing')} {startItem} - {endItem}{' '}
        {t('documents.list.of')} {totalDocuments}{' '}
        {t('documents.list.documents_text')}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('documents.list.previous')}
        </Button>

        {/* Números de página */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === -1 || page === -2) {
              // Elipsis
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              )
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onGoToPage(page)}
                className={`w-8 h-8 p-0 ${
                  currentPage === page
                    ? 'bg-banking-primary text-white hover:bg-banking-primary/90'
                    : 'hover:bg-muted'
                }`}
              >
                {page}
              </Button>
            )
          })}
        </div>

        {/* Botón siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3"
        >
          {t('documents.list.next')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
