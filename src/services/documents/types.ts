/**
 * Document service types
 */

export interface DocumentMetadata {
  id?: string
  original_name: string
  alias: string
  user_id: string
  uploaded_at?: string
  storage_path: string
  signed_url?: string
  signed_url_expires_at?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface DocumentFormData {
  file: File
  alias: string
  areas: number[]
  categories: number[]
  sources: number[]
  tags: number[]
}

export interface DocumentUploadResponse {
  document: DocumentMetadata
  success: boolean
  error?: string
}

export interface UploadProgress {
  step: number
  message: string
  progress: number
}

export const UPLOAD_STEPS = [
  { step: 1, message: "Uploading Document...", progress: 20 },
  { step: 2, message: "Document Sent...", progress: 40 },
  { step: 3, message: "Generating Embeddings...", progress: 60 },
  { step: 4, message: "Saving to Database...", progress: 80 },
  { step: 5, message: "Saving to LexiMind Memory...", progress: 100 },
]