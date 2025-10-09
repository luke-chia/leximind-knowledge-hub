import { useState, useEffect } from 'react'

interface DocumentStats {
  totalDocuments: number
  totalSizeMB: number
  averageSizeMB: number
  lastUpdated: string
  cacheAgeMinutes: number
}

interface DocumentStatsResponse {
  status: string
  timestamp: string
  cache: DocumentStats
  signedUrls: {
    documentsWithUrls: number
    documentsWithoutUrls: number
    urlCoverage: number
  }
}

export const useDocumentStats = () => {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/documents/stats`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DocumentStatsResponse = await response.json()

      if (data.status === 'success') {
        setStats(data.cache)
      } else {
        throw new Error('API returned error status')
      }
    } catch (err) {
      console.error('Error fetching document stats:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Función para formatear la fecha
  const formatLastUpdated = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  // Función para formatear tamaños en MB
  const formatSizeMB = (sizeMB: number): string => {
    return `${sizeMB.toFixed(1)} MB`
  }

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    formatLastUpdated,
    formatSizeMB,
  }
}
