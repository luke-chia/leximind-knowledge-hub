import { useState, useEffect, useCallback } from 'react'

interface Document {
  id: string
  fileName: string
  fileSize: number
  contentType: string
  signedUrl: string
  hasSignedUrl: boolean
  createdAt: string
  updatedAt: string
  storagePath: string
  alias: string
  description: string
  area: string
}

interface DocumentsResponse {
  status: string
  timestamp: string
  documents: Document[]
  pagination: {
    total: number
    limit: number
    offset: number
    page: number
    totalPages: number
  }
}

interface MappedDocument {
  id: string
  title: string
  description: string
  type: string
  department: string
  lastOpened: string
  favorite: boolean
  signedUrl: string
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<MappedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)

  const ITEMS_PER_PAGE = 9

  // Función para extraer tipo de archivo del contentType
  const extractFileType = useCallback((contentType: string): string => {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'XLSX',
      'text/plain': 'TXT',
    }

    return typeMap[contentType] || 'FILE'
  }, [])

  // Función para formatear el área
  const formatArea = useCallback((area: string): string => {
    return area.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }, [])

  // Función para formatear tiempo relativo con lógica inteligente
  const formatRelativeTime = useCallback((dateString: string): string => {
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInMilliseconds = now.getTime() - date.getTime()

      const minutes = Math.floor(diffInMilliseconds / (1000 * 60))
      const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
      const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24))
      const weeks = Math.floor(days / 7)
      const months = Math.floor(days / 30)

      if (minutes < 1) {
        return 'hace unos segundos'
      } else if (minutes < 60) {
        return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
      } else if (hours < 24) {
        return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
      } else if (days < 7) {
        return `hace ${days} día${days !== 1 ? 's' : ''}`
      } else if (weeks < 4) {
        return `hace ${weeks} semana${weeks !== 1 ? 's' : ''}`
      } else if (months < 12) {
        return `hace ${months} mes${months !== 1 ? 'es' : ''}`
      } else {
        const years = Math.floor(months / 12)
        return `hace ${years} año${years !== 1 ? 's' : ''}`
      }
    } catch {
      return 'Fecha inválida'
    }
  }, [])

  // Función para mapear datos del API a formato del componente
  const mapDocument = useCallback(
    (doc: Document): MappedDocument => {
      return {
        id: doc.id,
        title: doc.alias,
        description: doc.description,
        type: extractFileType(doc.contentType),
        department: formatArea(doc.area),
        lastOpened: formatRelativeTime(doc.updatedAt),
        favorite: false, // Por defecto false, se puede implementar favoritos más adelante
        signedUrl: doc.signedUrl,
      }
    },
    [extractFileType, formatArea, formatRelativeTime]
  )

  const fetchDocuments = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true)
        setError(null)

        const offset = (page - 1) * ITEMS_PER_PAGE
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/documents/list?limit=${ITEMS_PER_PAGE}&offset=${offset}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: DocumentsResponse = await response.json()

        if (data.status === 'success') {
          const mappedDocuments = data.documents.map(mapDocument)
          setDocuments(mappedDocuments)
          setTotalPages(data.pagination.totalPages)
          setTotalDocuments(data.pagination.total)
          setCurrentPage(page)
        } else {
          throw new Error('API returned error status')
        }
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    },
    [mapDocument, ITEMS_PER_PAGE]
  )

  // Función para ir a página siguiente
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchDocuments(currentPage + 1)
    }
  }, [currentPage, totalPages, fetchDocuments])

  // Función para ir a página anterior
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchDocuments(currentPage - 1)
    }
  }, [currentPage, fetchDocuments])

  // Función para ir a página específica
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        fetchDocuments(page)
      }
    },
    [totalPages, fetchDocuments]
  )

  useEffect(() => {
    fetchDocuments(1)
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    currentPage,
    totalPages,
    totalDocuments,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchDocuments(currentPage),
  }
}
