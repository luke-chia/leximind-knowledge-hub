/**
 * Filters API layer - handles all Supabase database calls
 * Single Responsibility: Database operations only
 */
import { supabase } from '@/lib/supabase'
import type { Area, Category, Source, Tag, FiltersApiResponse } from './types'

/**
 * Fetch all areas from Supabase
 */
export const fetchAreas = async (): Promise<FiltersApiResponse<Area>> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching areas:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error fetching areas'
    console.error('Unexpected error fetching areas:', err)
    return { data: null, error: errorMessage }
  }
}

/**
 * Fetch all categories from Supabase
 */
export const fetchCategories = async (): Promise<
  FiltersApiResponse<Category>
> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error fetching categories'
    console.error('Unexpected error fetching categories:', err)
    return { data: null, error: errorMessage }
  }
}

/**
 * Fetch all sources from Supabase
 */
export const fetchSources = async (): Promise<FiltersApiResponse<Source>> => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching sources:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error fetching sources'
    console.error('Unexpected error fetching sources:', err)
    return { data: null, error: errorMessage }
  }
}

/**
 * Fetch all tags from Supabase
 */
export const fetchTags = async (): Promise<FiltersApiResponse<Tag>> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error fetching tags'
    console.error('Unexpected error fetching tags:', err)
    return { data: null, error: errorMessage }
  }
}

/**
 * Fetch all filters in parallel for better performance
 * Uses Promise.allSettled to ensure partial failures don't break the entire load
 */
export const fetchAllFilters = async () => {
  const results = await Promise.allSettled([
    fetchAreas(),
    fetchCategories(),
    fetchSources(),
    fetchTags(),
  ])

  return {
    areas:
      results[0].status === 'fulfilled'
        ? results[0].value
        : { data: null, error: 'Failed to fetch areas' },
    categories:
      results[1].status === 'fulfilled'
        ? results[1].value
        : { data: null, error: 'Failed to fetch categories' },
    sources:
      results[2].status === 'fulfilled'
        ? results[2].value
        : { data: null, error: 'Failed to fetch sources' },
    tags:
      results[3].status === 'fulfilled'
        ? results[3].value
        : { data: null, error: 'Failed to fetch tags' },
  }
}
