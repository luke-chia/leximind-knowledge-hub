/**
 * Application Initializer - handles startup logic
 * Single Responsibility: App initialization only
 */
import { useEffect } from 'react'
import { usePrefetchFilters } from '@/hooks/useFilters'

interface AppInitializerProps {
  children: React.ReactNode
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const { prefetchFilters } = usePrefetchFilters()

  useEffect(() => {
    // Prefetch filters on app startup for better UX
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app: Loading filters...')
        await prefetchFilters()
        console.log('✅ Filters loaded successfully')
      } catch (error) {
        console.warn('⚠️ Failed to preload filters:', error)
        // App continues to work with fallback values
      }
    }

    initializeApp()
  }, [prefetchFilters])

  return <>{children}</>
}
