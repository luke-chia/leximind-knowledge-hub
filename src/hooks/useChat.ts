import { useState, useCallback } from 'react'
import { ChatService, ChatRequest, ChatError, ChatResponse } from '../services'
import { useApi } from './useApi'

export interface UseChatReturn {
  processMessage: (
    message: string,
    filters?: {
      area: string
      categoria: string[]
      fuente: string[]
      anio: string[]
      tags: string[]
    }
  ) => Promise<ChatResponse>
  isLoading: boolean
  error: ChatError | null
  reset: () => void
}

export function useChat(): UseChatReturn {
  const [error, setError] = useState<ChatError | null>(null)

  const {
    execute,
    loading: isLoading,
    reset: resetApi,
  } = useApi<ChatResponse>(async (request: ChatRequest) => {
    return await ChatService.processMessage(request)
  })

  const processMessage = useCallback(
    async (
      message: string,
      filters?: {
        area: string
        categoria: string[]
        fuente: string[]
        anio: string[]
        tags: string[]
      }
    ): Promise<ChatResponse> => {
      try {
        setError(null)

        // Log de los parámetros recibidos
        console.log('=== useChat.processMessage - PARAMS DEBUG ===')
        console.log('message:', message)
        console.log('filters:', filters)
        console.log('=============================================')

        // Usar los filtros tal como vienen o arrays vacíos si no hay filtros
        const area = filters?.area ? [filters.area] : []
        const category = filters?.categoria || []
        const source = filters?.fuente || []
        const tags = filters?.tags || []

        // Log de los valores procesados
        console.log('=== useChat.processMessage - PROCESSED VALUES ===')
        console.log('area:', area)
        console.log('category:', category)
        console.log('source:', source)
        console.log('tags:', tags)
        console.log('=================================================')

        const request = ChatService.createRequest(
          message,
          'user123',
          area,
          category,
          source,
          tags
        )

        const result = await execute(request)
        return result || { response: '', timestamp: '', sources: [] }
      } catch (err) {
        const chatError = err as ChatError
        setError(chatError)
        throw chatError
      }
    },
    [execute]
  )

  const reset = useCallback(() => {
    setError(null)
    resetApi()
  }, [resetApi])

  return {
    processMessage,
    isLoading,
    error,
    reset,
  }
}
