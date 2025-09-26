export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  code: number
  details?: any
}

export interface RequestConfig {
  timeout?: number
  headers?: Record<string, string>
}
