/**
 * Documents API layer - handles all Supabase operations
 */
import { supabase } from '@/lib/supabase'
import type {
  DocumentMetadata,
  DocumentFormData,
  DocumentUploadResponse,
} from './types'

// Import filter entities type (we'll need to get this from the hook)
interface FilterEntity {
  id: number
  name: string
}

interface FilterEntities {
  areas?: FilterEntity[]
  categories?: FilterEntity[]
  sources?: FilterEntity[]
  tags?: FilterEntity[]
}

const ALLOWED_FILE_TYPES = ['.pdf']
const STORAGE_BUCKET = 'documents'
const LEXIMIND_API_BASE = import.meta.env.VITE_API_BASE_URL

/**
 * Send document to LexiMind Memory backend
 */
const sendToLexiMindMemory = async (
  file: File,
  formData: DocumentFormData,
  filterEntities: FilterEntities,
  userId: string,
  documentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!LEXIMIND_API_BASE) {
      throw new Error('VITE_API_BASE_URL no está configurado')
    }

    // Convert IDs to names using filterEntities
    const areaNames = formData.areas
      .map((id) => filterEntities.areas?.find((a) => a.id === id)?.name)
      .filter(Boolean) as string[]

    const categoryNames = formData.categories
      .map((id) => filterEntities.categories?.find((c) => c.id === id)?.name)
      .filter(Boolean) as string[]

    const sourceNames = formData.sources
      .map((id) => filterEntities.sources?.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[]

    const tagNames = formData.tags
      .map((id) => filterEntities.tags?.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[]

    // Create FormData for the API call
    const lexiFormData = new FormData()
    lexiFormData.append('file', file)
    lexiFormData.append('userId', userId)
    lexiFormData.append('documentId', documentId)
    lexiFormData.append('savepdf', 'false')

    // Add arrays as JSON strings (as per spec)
    if (areaNames.length > 0) {
      lexiFormData.append('area', JSON.stringify(areaNames))
    }
    if (categoryNames.length > 0) {
      lexiFormData.append('category', JSON.stringify(categoryNames))
    }
    if (sourceNames.length > 0) {
      lexiFormData.append('source', JSON.stringify(sourceNames))
    }
    if (tagNames.length > 0) {
      lexiFormData.append('tags', JSON.stringify(tagNames))
    }

    const response = await fetch(`${LEXIMIND_API_BASE}/documents/upload`, {
      method: 'POST',
      body: lexiFormData,
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Error desconocido' }))
      throw new Error(errorData.message || `Error HTTP: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ LexiMind Memory upload successful:', result)

    return { success: true }
  } catch (error) {
    console.error('❌ LexiMind Memory upload failed:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al enviar a LexiMind Memory',
    }
  }
}

/**
 * Upload file to Supabase Storage and create document record
 */
export const uploadDocument = async (
  formData: DocumentFormData,
  filterEntities: FilterEntities,
  onProgress?: (step: number) => void
): Promise<DocumentUploadResponse> => {
  try {
    // Step 1: Validate file type
    const fileExtension =
      '.' + formData.file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      return {
        document: {} as DocumentMetadata,
        success: false,
        error: 'Only PDF files are allowed',
      }
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    onProgress?.(1) // Uploading Document...

    // Step 2: Upload file to Supabase Storage
    const fileName = `V1-${formData.file.name}`
    const storagePath = `${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, formData.file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    onProgress?.(2) // Document Sent...

    // Step 3: Generate signed URL (simulated embedding generation)
    const { data: urlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 3600 * 24 * 7) // 7 days

    onProgress?.(3) //

    // Step 4: Insert document metadata
    const documentData: Omit<DocumentMetadata, 'id'> = {
      original_name: formData.file.name,
      alias: formData.alias,
      description: formData.description,
      URL_Reference: formData.url_reference || null,
      file_size: formData.file.size,
      content_type: formData.file.type,
      user_id: user.id,
      storage_path: storagePath,
      signed_url: urlData?.signedUrl,
      signed_url_expires_at: new Date(
        Date.now() + 7 * 24 * 3600 * 1000
      ).toISOString(),
      created_by: user.id,
      updated_by: user.id,
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (docError) {
      throw new Error(`Database insert failed: ${docError.message}`)
    }

    onProgress?.(4) // Saving to Database...

    // Step 5: Create join table relationships
    await Promise.all(
      [
        // Insert areas
        formData.areas.length > 0 &&
          supabase.from('document_areas').insert(
            formData.areas.map((areaId) => ({
              document_id: document.id,
              area_id: areaId,
              created_by: user.id,
              updated_by: user.id,
            }))
          ),

        // Insert categories
        formData.categories.length > 0 &&
          supabase.from('document_categories').insert(
            formData.categories.map((categoryId) => ({
              document_id: document.id,
              category_id: categoryId,
              created_by: user.id,
              updated_by: user.id,
            }))
          ),

        // Insert sources
        formData.sources.length > 0 &&
          supabase.from('document_sources').insert(
            formData.sources.map((sourceId) => ({
              document_id: document.id,
              source_id: sourceId,
              created_by: user.id,
              updated_by: user.id,
            }))
          ),

        // Insert tags
        formData.tags.length > 0 &&
          supabase.from('document_tags').insert(
            formData.tags.map((tagId) => ({
              document_id: document.id,
              tag_id: tagId,
              created_by: user.id,
              updated_by: user.id,
            }))
          ),
      ].filter(Boolean)
    )

    // Step 5: Send to LexiMind Memory backend
    onProgress?.(5) // This will trigger the carousel

    const lexiMindResult = await sendToLexiMindMemory(
      formData.file,
      formData,
      filterEntities,
      user.id,
      document.id
    )

    // If LexiMind Memory fails, we still return success but with a warning
    if (!lexiMindResult.success) {
      console.warn('⚠️ LexiMind Memory upload failed:', lexiMindResult.error)
      // You could also store this error in the document metadata if needed
    }

    return {
      document,
      success: true,
      lexiMindWarning: lexiMindResult.success
        ? undefined
        : lexiMindResult.error,
    }
  } catch (error) {
    console.error('Document upload error:', error)
    return {
      document: {} as DocumentMetadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
