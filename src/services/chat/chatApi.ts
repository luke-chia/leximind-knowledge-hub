import { ChatRequest, ChatResponse } from './types'
import { makeRequest, getApiUrl } from '../../utils/api'

export class ChatApi {
  private static readonly ENDPOINT = '/chats/process-message/'

  static async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const url = getApiUrl(this.ENDPOINT)
      const requestBody = JSON.stringify(request)

      // Log detallado del payload que se envía al API
      console.log('=== ChatApi.processMessage - PAYLOAD DEBUG ===')
      console.log('URL completa:', url)
      console.log('Method: POST')
      console.log('Headers: Content-Type: application/json')
      console.log('Body (raw string):', requestBody)
      console.log('Body (parsed object):', JSON.parse(requestBody))
      console.log('Body length:', requestBody.length, 'bytes')
      console.log('==============================================')

      const response = await makeRequest<ChatResponse>(url, {
        method: 'POST',
        body: requestBody,
      })

      console.log('=== ChatApi.processMessage - RESPONSE DEBUG ===')
      console.log('respuesta de leximind:', response)
      console.log('===============================================')

      return response
    } catch (error) {
      console.error('Error en ChatApi.processMessage:', error)
      throw error
    }
  }
}
