/**
 * API service for messages management
 */
import { supabase } from '@/lib/supabase'
import type { Message, MessageCreate } from './types'

export class MessagesApi {
  /**
   * Create a new message in a conversation
   */
  static async createMessage(data: MessageCreate): Promise<Message> {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting current user:', userError)
      throw new Error('User must be authenticated to create message')
    }

    // Create message with user_id
    const messageData = {
      ...data,
      user_id: user.id,
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      throw new Error(`Failed to create message: ${error.message}`)
    }

    return message
  }

  /**
   * Get all messages for a conversation
   */
  static async getConversationMessages(
    conversationId: string
  ): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return messages || []
  }

  /**
   * Get a specific message by ID
   */
  static async getMessage(id: string): Promise<Message | null> {
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Message not found
      }
      console.error('Error fetching message:', error)
      throw new Error(`Failed to fetch message: ${error.message}`)
    }

    return message
  }

  /**
   * Update a message
   */
  static async updateMessage(
    id: string,
    updates: Partial<Omit<MessageCreate, 'conversation_id'>>
  ): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating message:', error)
      throw new Error(`Failed to update message: ${error.message}`)
    }

    return message
  }

  /**
   * Delete a message
   */
  static async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  /**
   * Create both user and assistant messages for a conversation
   */
  static async createConversationMessages(
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    userTokens?: number,
    assistantTokens?: number
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting current user:', userError)
      throw new Error('User must be authenticated to create messages')
    }

    // Create user message
    const userData = {
      conversation_id: conversationId,
      role: 'user' as const,
      content: userMessage,
      tokens: userTokens,
      user_id: user.id,
    }

    // Create assistant message
    const assistantData = {
      conversation_id: conversationId,
      role: 'assistant' as const,
      content: assistantMessage,
      tokens: assistantTokens,
      user_id: user.id,
    }

    // Insert both messages
    const { data: messages, error } = await supabase
      .from('messages')
      .insert([userData, assistantData])
      .select()

    if (error) {
      console.error('Error creating conversation messages:', error)
      throw new Error(
        `Failed to create conversation messages: ${error.message}`
      )
    }

    if (!messages || messages.length !== 2) {
      throw new Error('Failed to create both messages')
    }

    return {
      userMessage: messages[0],
      assistantMessage: messages[1],
    }
  }
}
