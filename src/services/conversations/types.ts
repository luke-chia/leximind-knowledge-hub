/**
 * Types for conversations and messages
 */

export interface Conversation {
  id: string
  user_id: string
  title: string | null
  created_at: string
}

export interface ConversationCreate {
  title: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number | null
  created_at: string
}

export interface MessageCreate {
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number | null
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}
