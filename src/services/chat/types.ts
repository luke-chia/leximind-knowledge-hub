export interface ChatRequest {
  userId: string
  message: string
  area: string[]
  category: string[]
  source: string[]
  tags: string[]
}

export interface SourceReference {
  page: string
  matchingText: string
  source: string
}

export interface ChatResponse {
  response: string
  timestamp: string
  sources?: SourceReference[]
}

export interface ChatError {
  message: string
  code?: number
  details?: string
}

export interface ChatState {
  isLoading: boolean
  error: ChatError | null
  data: string | null
}
