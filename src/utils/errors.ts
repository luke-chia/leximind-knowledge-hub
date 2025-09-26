import { ApiError } from './types'

export class HttpError extends Error {
  public code: number
  public details?: any

  constructor(message: string, code: number, details?: any) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.details = details
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof HttpError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    }
  }

  if (error.response) {
    // Error de respuesta HTTP
    const status = error.response.status
    const message = error.response.data?.message || `HTTP Error ${status}`
    return {
      message,
      code: status,
      details: error.response.data
    }
  }

  if (error.request) {
    // Error de red
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      code: 0,
      details: error.request
    }
  }

  // Error desconocido
  return {
    message: error.message || 'Error desconocido',
    code: -1,
    details: error
  }
}

export const getErrorMessage = (error: ApiError): string => {
  switch (error.code) {
    case 400:
      return 'Solicitud inválida. Verifica los datos enviados.'
    case 401:
      return 'No autorizado. Inicia sesión nuevamente.'
    case 403:
      return 'Acceso denegado. No tienes permisos para esta acción.'
    case 404:
      return 'Recurso no encontrado.'
    case 500:
      return 'Error interno del servidor. Intenta nuevamente más tarde.'
    case 502:
      return 'Servicio no disponible temporalmente.'
    case 503:
      return 'Servicio temporalmente fuera de servicio.'
    case 0:
      return 'Error de conexión. Verifica tu conexión a internet.'
    default:
      return error.message || 'Error desconocido'
  }
}
