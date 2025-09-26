import { useQuery } from '@tanstack/react-query'
import { fetchAllFilters } from '@/services/filters/filtersApi'
import type { Area, Category, Source, Tag } from '@/services/filters/types'

export interface FilterEntities {
  areas: Area[]
  categories: Category[]
  sources: Source[]
  tags: Tag[]
}

export interface FilterEntitiesState {
  isLoading: boolean
  error: string | null
  data: FilterEntities | null
}

const FILTER_ENTITIES_QUERY_KEY = ['filter-entities'] as const

export const useFilterEntities = (): FilterEntitiesState => {
  const {
    data: apiResponse,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: FILTER_ENTITIES_QUERY_KEY,
    queryFn: fetchAllFilters,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (updated from cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  })

  // Transform API response to component-friendly format
  const transformedData: FilterEntities | null = apiResponse ? {
    areas: apiResponse.areas.data || [],
    categories: apiResponse.categories.data || [],
    sources: apiResponse.sources.data || [],
    tags: apiResponse.tags.data || [],
  } : null

  return {
    isLoading,
    error: isError
      ? error?.message || 'Failed to load filter entities'
      : null,
    data: transformedData,
  }
}