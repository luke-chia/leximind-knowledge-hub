/**
 * Types and interfaces for dynamic filters from Supabase
 * Following clean architecture principles
 */

// Base interface for all filter entities
export interface BaseFilterEntity {
  id: number
  name: string
  created_at: string
}

// Specific interfaces for each table
export interface Area extends BaseFilterEntity {}

export interface Category extends BaseFilterEntity {}

export interface Source extends BaseFilterEntity {}

export interface Tag extends BaseFilterEntity {}

// Response types for API calls
export interface FiltersApiResponse<T> {
  data: T[] | null
  error: string | null
}

// Aggregated filters for the application
export interface FilterOptions {
  areas: string[]
  categories: string[]
  sources: string[]
  tags: string[]
}

// Filter state used by components
export interface FilterState {
  area: string[]
  categoria: string[]
  fuente: string[]
  tags: string[]
}

// Loading and error states
export interface FiltersQueryState {
  isLoading: boolean
  error: string | null
  data: FilterOptions | null
}

// Service response wrapper
export interface ServiceResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}
