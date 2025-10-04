import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  Copy,
  Eye,
  Link,
  Infinity as InfinityIcon, // No change needed here
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { SearchInterface } from './SearchInterface'
import { useChat } from '@/hooks/useChat'
import { SourceReference } from '@/services/chat/types'
import { usePDFViewer } from '@/hooks/usePDFViewer'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
  sources?: SourceReference[]
}

interface ChatInterfaceProps {
  query: string
  onNewChat: () => void
}

// Generador de IDs únicos
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function ChatInterface({ query, onNewChat }: ChatInterfaceProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null)
  const [expandedReferences, setExpandedReferences] = useState<
    Record<string, boolean>
  >({})
  const { toast } = useToast()
  const { openPDF } = usePDFViewer()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeMessageRef = useRef<HTMLDivElement>(null)
  const { processMessage, isLoading: apiLoading, error: apiError } = useChat()
  const hasProcessedQuery = useRef(false)

  // Helper function to scroll to the active message
  const scrollToActiveMessage = useCallback(() => {
    if (activeMessageRef.current) {
      activeMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [])

  // Helper function to scroll to bottom for general use
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  }, [])

  const handleNewSearch = (searchParams: {
    query: string
    filters?: {
      area: string
      categoria: string[]
      fuente: string[]
      anio: string[]
      tags: string[]
    }
  }) => {
    processMessageWithTyping(searchParams.query, searchParams.filters)
  }

  // Process message with typing animation
  const processMessageWithTyping = useCallback(
    async (
      userQuery: string,
      filters?: {
        area: string
        categoria: string[]
        fuente: string[]
        anio: string[]
        tags: string[]
      }
    ) => {
      // Add user message
      const userMessage: Message = {
        id: generateId(),
        type: 'user',
        content: userQuery,
        timestamp: new Date(),
      }

      // Add loading message
      const loadingMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      }

      setMessages((prev) => [...prev, userMessage, loadingMessage])
      setActiveResponseId(loadingMessage.id)

      try {
        // Call the API
        const response = await processMessage(userQuery, filters)

        // Remove loading message and start typing animation
        setMessages((prev) => prev.slice(0, -1))
        setIsTyping(true)

        // Create a single ID for the typing message
        const typingMessageId = generateId()
        setActiveResponseId(typingMessageId)

        // Simulate typing animation with real response
        let typedContent = ''
        const words = response.response.split(' ')

        for (let i = 0; i < words.length; i++) {
          typedContent += (i > 0 ? ' ' : '') + words[i]

          const assistantMessage: Message = {
            id: typingMessageId, // Use the same ID throughout typing
            type: 'assistant',
            content: typedContent,
            timestamp: new Date(),
            sources: response.sources, // Agregar las sources al mensaje
          }

          setMessages((prev) => {
            // Keep all messages except replace the last assistant message (if any)
            const messagesWithoutLastAssistant = prev.filter(
              (msg, index) =>
                !(index === prev.length - 1 && msg.type === 'assistant')
            )
            return [...messagesWithoutLastAssistant, assistantMessage]
          })

          // Scroll to the active message after each word during typing
          scrollToActiveMessage()

          // Random delay between words to simulate natural typing
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100 + 50)
          )
        }

        // Stop typing animation
        setIsTyping(false)
        setActiveResponseId(null)
      } catch (error) {
        // Remove loading message
        setMessages((prev) => prev.slice(0, -1))

        // Add error message
        const errorMessage: Message = {
          id: generateId(),
          type: 'assistant',
          content: `Error: ${
            apiError?.message || 'Error al procesar la consulta'
          }`,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
        setIsTyping(false)
        setActiveResponseId(null)

        // Show error toast
        toast({
          title: t('errors.title'),
          description: apiError?.message || t('errors.generic'),
          variant: 'destructive',
        })
      }
    },
    [processMessage, apiError, toast, t, scrollToActiveMessage]
  )

  // Initialize with the query only on first mount
  useEffect(() => {
    if (query && !hasProcessedQuery.current) {
      hasProcessedQuery.current = true
      processMessageWithTyping(query)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount to avoid re-processing initial query

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto scroll during typing animation with smooth behavior
  // Auto scroll to active message during typing
  useEffect(() => {
    if (isTyping) {
      const intervalId = setInterval(() => {
        scrollToActiveMessage()
      }, 100) // Scroll every 100ms during typing

      return () => clearInterval(intervalId)
    }
  }, [isTyping, scrollToActiveMessage])

  const handleFeedback = (messageId: string, positive: boolean) => {
    toast({
      title: t('actions.feedback_' + (positive ? 'positive' : 'negative')),
      description: t(
        'actions.feedback_' + (positive ? 'positive' : 'negative')
      ),
    })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: t('actions.copied'),
      description: t('actions.copied'),
    })
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Función para formatear texto con saltos de línea
  const formatTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <span key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ))
  }

  // Función para toggle referencias
  const toggleReferences = (messageId: string) => {
    setExpandedReferences((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  const handleOpenPDF = (documentName: string) => {
    // URL fija como se especificó en los requerimientos
    const pdfUrl =
      'https://drive.google.com/file/d/1P3jePAbuqqp9jMNlrKKJ-5SjYWh19dCm/view?usp=drive_link'

    openPDF(pdfUrl, documentName)
  }

  // Función para formatear texto matching (primeros 80 caracteres)
  const formatMatchingText = (text: string) => {
    return text.length > 80 ? text.substring(0, 80) + '.....' : text
  }

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto px-6">
      <ScrollArea ref={scrollAreaRef} className="flex-1 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {message.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] space-y-2">
                    <div className="text-right text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    <Card className="bg-banking-primary text-white p-4 rounded-2xl rounded-tr-sm">
                      <p className="text-lg">{message.content}</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div
                  className="max-w-[90%] space-y-4"
                  ref={
                    isTyping && activeResponseId === message.id
                      ? activeMessageRef
                      : null
                  }
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-3 p-4">
                      <div className="text-muted-foreground">
                        {t('messages.thinking')}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Show spinner above the response during typing animation */}
                      {isTyping && activeResponseId === message.id && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-banking-primary">
                            <InfinityIcon className="w-4 h-4 text-white animate-infinity" />
                          </div>
                          <div className="text-muted-foreground">
                            {t('messages.thinking')}
                          </div>
                        </div>
                      )}

                      <Card className="bg-card border-banking-primary/20 p-6 rounded-2xl rounded-tl-sm">
                        <div className="prose prose-invert max-w-none">
                          <p className="text-base leading-relaxed text-card-foreground mb-0">
                            {formatTextWithLineBreaks(message.content)}
                          </p>
                        </div>
                      </Card>

                      {/* Action buttons - only show after response is complete */}
                      {!isTyping && (
                        <>
                          <div className="flex items-center gap-2 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, true)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, false)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.content)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {/* Solo mostrar el botón si hay sources */}
                            {message.sources && message.sources.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReferences(message.id)}
                                className="text-sm px-3 h-8 hover:bg-banking-primary/10 text-muted-foreground"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('actions.references')} (
                                {message.sources.length})
                              </Button>
                            )}
                          </div>

                          {/* Referencias expandibles */}
                          {message.sources &&
                            message.sources.length > 0 &&
                            expandedReferences[message.id] && (
                              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                  Referencias ({message.sources.length})
                                </h4>
                                <div className="space-y-2">
                                  {message.sources.map((source, index) => (
                                    <div
                                      key={index}
                                      className="text-xs text-muted-foreground border-l-2 border-banking-primary/30 pl-3"
                                    >
                                      <div className="font-medium flex items-center justify-between">
                                        <span>
                                          {source.source} - Pag. {source.page}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenPDF(source.source)
                                          }
                                          className="h-6 w-6 p-0 hover:bg-banking-primary/20 ml-2"
                                          title={t('actions.view_document')}
                                        >
                                          <Link className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="mt-1">
                                        Match:{' '}
                                        {formatMatchingText(
                                          source.matchingText
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Continue searching - only show after response is complete */}
                          {message.id === messages[messages.length - 1]?.id && (
                            <div className="mt-6 px-2">
                              <SearchInterface
                                onSearch={handleNewSearch}
                                minimal={true}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
