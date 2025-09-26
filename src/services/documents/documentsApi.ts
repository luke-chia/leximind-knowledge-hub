/**
 * Documents API layer - handles all Supabase operations
 */
import { supabase } from '@/lib/supabase'
import type { DocumentMetadata, DocumentFormData, DocumentUploadResponse } from './types'

const ALLOWED_FILE_TYPES = ['.pdf']
const STORAGE_BUCKET = 'documents'

/**
 * Upload file to Supabase Storage and create document record
 */
export const uploadDocument = async (
  formData: DocumentFormData,
  onProgress?: (step: number) => void
): Promise<DocumentUploadResponse> => {
  try {
    // Step 1: Validate file type
    const fileExtension = '.' + formData.file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      return {
        document: {} as DocumentMetadata,
        success: false,
        error: 'Only PDF files are allowed'
      }
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    onProgress?.(1) // Uploading Document...

    // Step 2: Upload file to Supabase Storage
    const fileName = `${Date.now()}-${formData.file.name}`
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

    onProgress?.(3) // Generating Embeddings...

    // Step 4: Insert document metadata
    const documentData: Omit<DocumentMetadata, 'id'> = {
      original_name: formData.file.name,
      alias: formData.alias,
      user_id: user.id,
      storage_path: storagePath,
      signed_url: urlData?.signedUrl,
      signed_url_expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_by: user.id,
      updated_by: user.id
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
    await Promise.all([
      // Insert areas
      formData.areas.length > 0 && supabase
        .from('document_areas')
        .insert(
          formData.areas.map(areaId => ({
            document_id: document.id,
            area_id: areaId,
            created_by: user.id,
            updated_by: user.id
          }))
        ),
      
      // Insert categories
      formData.categories.length > 0 && supabase
        .from('document_categories')
        .insert(
          formData.categories.map(categoryId => ({
            document_id: document.id,
            category_id: categoryId,
            created_by: user.id,
            updated_by: user.id
          }))
        ),
      
      // Insert sources
      formData.sources.length > 0 && supabase
        .from('document_sources')
        .insert(
          formData.sources.map(sourceId => ({
            document_id: document.id,
            source_id: sourceId,
            created_by: user.id,
            updated_by: user.id
          }))
        ),
      
      // Insert tags
      formData.tags.length > 0 && supabase
        .from('document_tags')
        .insert(
          formData.tags.map(tagId => ({
            document_id: document.id,
            tag_id: tagId,
            created_by: user.id,
            updated_by: user.id
          }))
        )
    ].filter(Boolean))

    onProgress?.(5) // Saving to LexiMind Memory...

    return {
      document,
      success: true
    }

  } catch (error) {
    console.error('Document upload error:', error)
    return {
      document: {} as DocumentMetadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}