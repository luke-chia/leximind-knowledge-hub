/**
 * API service for conversations management
 */
import { supabase } from '@/lib/supabase'
import type {
  Conversation,
  ConversationCreate,
  ConversationWithMessages,
} from './types'

export class ConversationsApi {
  /**
   * Create a new conversation
   */
  static async createConversation(
    data: ConversationCreate
  ): Promise<Conversation> {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting current user:', userError)
      throw new Error('User must be authenticated to create conversation')
    }

    // Create conversation with user_id
    const conversationData = {
      ...data,
      user_id: user.id,
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    return conversation
  }

  /**
   * Get all conversations for the current user
   */
  static async getUserConversations(): Promise<Conversation[]> {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }

    return conversations || []
  }

  /**
   * Get a specific conversation by ID
   */
  static async getConversation(id: string): Promise<Conversation | null> {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Conversation not found
      }
      console.error('Error fetching conversation:', error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    return conversation
  }

  /**
   * Get conversation with its messages
   */
  static async getConversationWithMessages(
    id: string
  ): Promise<ConversationWithMessages | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(
        `
        *,
        messages (*)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Conversation not found
      }
      console.error('Error fetching conversation with messages:', error)
      throw new Error(
        `Failed to fetch conversation with messages: ${error.message}`
      )
    }

    return data as ConversationWithMessages
  }

  /**
   * Update conversation title
   */
  static async updateConversation(
    id: string,
    updates: Partial<ConversationCreate>
  ): Promise<Conversation> {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating conversation:', error)
      throw new Error(`Failed to update conversation: ${error.message}`)
    }

    return conversation
  }

  /**
   * Delete a conversation (cascade will delete messages)
   */
  static async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase.from('conversations').delete().eq('id', id)

    if (error) {
      console.error('Error deleting conversation:', error)
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }
  }
}
