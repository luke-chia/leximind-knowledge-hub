import { RequestConfig } from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const apiConfig: RequestConfig = {
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
}

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

export const makeRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout)

  try {
    const finalOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        ...apiConfig.headers,
        ...options.headers,
      },
    }

    // Log detallado de la petición HTTP
    console.log('=== makeRequest - HTTP DEBUG ===')
    console.log('URL:', url)
    console.log('Method:', finalOptions.method || 'GET')
    console.log('Headers:', finalOptions.headers)
    console.log('Body:', finalOptions.body)
    console.log('================================')

    const response = await fetch(url, finalOptions)

    clearTimeout(timeoutId)

    console.log('=== makeRequest - HTTP RESPONSE DEBUG ===')
    console.log('Status:', response.status)
    console.log('StatusText:', response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    console.log('=========================================')

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorDetails = ''
      try {
        const errorText = await response.text()
        errorDetails = errorText
        console.log('=== ERROR RESPONSE BODY ===')
        console.log('Error body (raw):', errorText)
        try {
          const errorJson = JSON.parse(errorText)
          console.log('Error body (parsed):', errorJson)
        } catch {
          console.log('Error body is not valid JSON')
        }
        console.log('===========================')
      } catch (e) {
        console.log('Could not read error response body:', e)
      }

      throw new Error(
        `HTTP Error ${response.status}: ${response.statusText}${
          errorDetails ? ` - ${errorDetails}` : ''
        }`
      )
    }

    const data = await response.json()
    console.log('=== makeRequest - PARSED RESPONSE ===')
    console.log('Response data:', data)
    console.log('=====================================')

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    console.log('=== makeRequest - ERROR CAUGHT ===')
    console.log('Error:', error)
    console.log('==================================')

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo')
    }

    throw error
  }
}
