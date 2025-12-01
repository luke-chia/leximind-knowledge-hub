import { useState, useCallback } from 'react'
import { nlsqlService, NLSQLResponse } from '@/services/nlsql'

interface UseNLSQLState {
  loading: boolean
  error: string | null
  response: NLSQLResponse | null
}

export const useNLSQL = () => {
  const [state, setState] = useState<UseNLSQLState>({
    loading: false,
    error: null,
    response: null,
  })

  const executeQuery = useCallback(async (question: string) => {
    if (!question || question.trim().length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Por favor ingresa una pregunta válida',
      }))
      return
    }

    setState({
      loading: true,
      error: null,
      response: null,
    })

    try {
      const response = await nlsqlService.executeNLQuery(question)
      setState({
        loading: false,
        error: null,
        response,
      })
      return response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      setState({
        loading: false,
        error: errorMessage,
        response: null,
      })
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      response: null,
    })
  }, [])

  return {
    ...state,
    executeQuery,
    clearError,
    reset,
  }
}
