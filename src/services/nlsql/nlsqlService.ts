const NLSQL_API_BASE_URL =
  import.meta.env.VITE_NLSQL_API_BASE_URL || 'http://127.0.0.1:3000'

export interface NLSQLRequest {
  question: string
}

export interface NLSQLResponse {
  question: string
  generatedSQL: string
  results: Array<Record<string, unknown>>
  metadata: {
    rowCount: number
    executionTime: string
    tablesUsed: string[]
    modelId: string
    isValid: boolean
    schemas: string[]
  }
}

export interface NLSQLError {
  error: string
  message: string
  details?: Record<string, unknown>
}

export class NLSQLService {
  private static instance: NLSQLService
  private baseUrl: string

  private constructor() {
    this.baseUrl = NLSQL_API_BASE_URL
  }

  static getInstance(): NLSQLService {
    if (!NLSQLService.instance) {
      NLSQLService.instance = new NLSQLService()
    }
    return NLSQLService.instance
  }

  async executeNLQuery(question: string): Promise<NLSQLResponse> {
    if (!question || question.trim().length < 10) {
      throw new Error('La pregunta debe tener al menos 10 caracteres')
    }

    if (question.length > 1000) {
      throw new Error('La pregunta no puede exceder los 1000 caracteres')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/nl_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!response.ok) {
        const errorData: NLSQLError = await response.json()
        throw new Error(errorData.message || `Error HTTP: ${response.status}`)
      }

      const data: NLSQLResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al ejecutar la consulta')
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      })
      return response.ok
    } catch (error) {
      console.warn('No se pudo conectar al servicio NL-SQL:', error)
      return false
    }
  }
}

export const nlsqlService = NLSQLService.getInstance()
