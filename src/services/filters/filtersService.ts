/**
 * Filters Service - Business logic layer
 * Open/Closed Principle: Open for extension, closed for modification
 * Dependency Inversion: Depends on abstractions, not concretions
 */
import { fetchAllFilters } from './filtersApi'
import type { FilterOptions, ServiceResponse } from './types'

/**
 * Transform API response to FilterOptions format expected by components
 */
const transformFiltersResponse = (
  apiResponse: Awaited<ReturnType<typeof fetchAllFilters>>
): FilterOptions => {
  return {
    areas: apiResponse.areas.data?.map((area) => area.name) || ['N/A'],
    categories: apiResponse.categories.data?.map(
      (category) => category.name
    ) || ['N/A'],
    sources: apiResponse.sources.data?.map((source) => source.name) || ['N/A'],
    tags: apiResponse.tags.data?.map((tag) => tag.name) || ['N/A'],
  }
}

/**
 * Get all filter options with error handling and fallbacks
 * Interface Segregation: Returns only what the client needs
 */
export const getFilterOptions = async (): Promise<
  ServiceResponse<FilterOptions>
> => {
  try {
    const apiResponse = await fetchAllFilters()

    // Check if any critical errors occurred
    const hasErrors = [
      apiResponse.areas.error,
      apiResponse.categories.error,
      apiResponse.sources.error,
      apiResponse.tags.error,
    ].some((error) => error !== null)

    // Transform response to component-friendly format
    const filterOptions = transformFiltersResponse(apiResponse)

    // Log errors but don't fail completely (graceful degradation)
    if (hasErrors) {
      console.warn('Some filters failed to load:', {
        areas: apiResponse.areas.error,
        categories: apiResponse.categories.error,
        sources: apiResponse.sources.error,
        tags: apiResponse.tags.error,
      })
    }

    return {
      success: true,
      data: filterOptions,
      error: hasErrors ? 'Some filters could not be loaded' : null,
    }
  } catch (error) {
    console.error('Service error getting filter options:', error)

    // Fallback to empty options with N/A values
    const fallbackOptions: FilterOptions = {
      areas: ['N/A'],
      categories: ['N/A'],
      sources: ['N/A'],
      tags: ['N/A'],
    }

    return {
      success: false,
      data: fallbackOptions,
      error: error instanceof Error ? error.message : 'Unknown service error',
    }
  }
}

/**
 * Validate if filter options are properly loaded
 * Single Responsibility: Validation logic only
 */
export const validateFilterOptions = (
  options: FilterOptions | null
): boolean => {
  if (!options) return false

  return Object.values(options).every(
    (filterArray) => Array.isArray(filterArray) && filterArray.length > 0
  )
}

/**
 * Get fallback filter options when service fails
 * Liskov Substitution: Can replace real options seamlessly
 */
export const getFallbackFilterOptions = (): FilterOptions => ({
  areas: ['N/A'],
  categories: ['N/A'],
  sources: ['N/A'],
  tags: ['N/A'],
})
