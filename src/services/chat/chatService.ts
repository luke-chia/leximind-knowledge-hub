import { ChatRequest, ChatResponse, ChatError } from './types'
import { ChatApi } from './chatApi'
import { handleApiError, getErrorMessage } from '../../utils/errors'

export class ChatService {
  static async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Log del request completo para debug
      console.log('=== ChatService.processMessage - REQUEST DEBUG ===')
      console.log('Request completo:', JSON.stringify(request, null, 2))
      console.log('================================================')

      // Validar request
      this.validateRequest(request)

      // Llamar a la API
      const response = await ChatApi.processMessage(request)

      return response
    } catch (error) {
      const apiError = handleApiError(error)
      const chatError: ChatError = {
        message: getErrorMessage(apiError),
        code: apiError.code,
        details: apiError.details,
      }

      console.error('Error en ChatService.processMessage:', chatError)
      throw chatError
    }
  }

  private static validateRequest(request: ChatRequest): void {
    if (!request.userId || request.userId.trim() === '') {
      throw new Error('userId es requerido')
    }

    if (!request.message || request.message.trim() === '') {
      throw new Error('message es requerido')
    }

    if (!Array.isArray(request.area)) {
      throw new Error('area debe ser un array')
    }

    if (!Array.isArray(request.category)) {
      throw new Error('category debe ser un array')
    }

    if (!Array.isArray(request.source)) {
      throw new Error('source debe ser un array')
    }

    if (!Array.isArray(request.tags)) {
      throw new Error('tags debe ser un array')
    }
  }
  static createRequest(
    message: string,
    userId: string = 'user123',
    area: string[] = [],
    category: string[] = [],
    source: string[] = [],
    tags: string[] = []
  ): ChatRequest {
    return {
      userId,
      message: message.trim(),
      area,
      category,
      source,
      tags,
    }
  }
}
