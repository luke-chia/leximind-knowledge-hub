/**
 * Custom hook for filters using React Query
 * Provides caching, background updates, and global state management
 */
import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFilterOptions,
  validateFilterOptions,
  getFallbackFilterOptions,
} from '@/services/filters'
import type { FilterOptions, FiltersQueryState } from '@/services/filters/types'

// Query key for React Query cache
const FILTERS_QUERY_KEY = ['filters', 'options'] as const

/**
 * Hook configuration for React Query
 * - staleTime: 15 minutes (filters don't change frequently)
 * - cacheTime: 30 minutes (keep in cache longer)
 * - refetchOnWindowFocus: false (avoid unnecessary refetches)
 * - retry: 2 (retry failed requests twice)
 */
const QUERY_CONFIG = {
  staleTime: 15 * 60 * 1000, // 15 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
}

/**
 * Main hook for accessing filter options
 * Follows the Hook Rules and provides consistent interface
 */
export const useFilters = (): FiltersQueryState => {
  const {
    data: serviceResponse,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: FILTERS_QUERY_KEY,
    queryFn: getFilterOptions,
    ...QUERY_CONFIG,
  })

  // Transform React Query state to component-friendly state
  const state: FiltersQueryState = {
    isLoading,
    error: isError
      ? error?.message || 'Failed to load filters'
      : serviceResponse?.error || null,
    data: serviceResponse?.data || null,
  }

  // Ensure we always return valid filter options
  if (!state.isLoading && !validateFilterOptions(state.data)) {
    state.data = getFallbackFilterOptions()
  }

  return state
}

/**
 * Hook for prefetching filters (useful for App.tsx initialization)
 * Single Responsibility: Only handles prefetching logic
 */
export const usePrefetchFilters = () => {
  const queryClient = useQueryClient()

  const prefetchFilters = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: FILTERS_QUERY_KEY,
      queryFn: getFilterOptions,
      ...QUERY_CONFIG,
    })
  }, [queryClient])

  return { prefetchFilters }
}

/**
 * Hook for invalidating filters cache (useful for admin operations)
 * Open/Closed Principle: Extensible without modifying core logic
 */
export const useInvalidateFilters = () => {
  const queryClient = useQueryClient()

  const invalidateFilters = async () => {
    await queryClient.invalidateQueries({
      queryKey: FILTERS_QUERY_KEY,
    })
  }

  return { invalidateFilters }
}

/**
 * Utility hook to check if filters are ready for use
 * Interface Segregation: Provides only the needed interface
 */
export const useFiltersReady = (): boolean => {
  const { isLoading, data } = useFilters()
  return !isLoading && validateFilterOptions(data)
}
