import { useState, useEffect } from 'react'
import { Send, Mic, Loader2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterPanel } from './FilterPanel'

interface SearchInterfaceProps {
  onSearch: (searchParams: {
    query: string
    filters?: {
      area: string[]
      categoria: string[]
      fuente: string[]
      tags: string[]
    }
  }) => void
  isLoading?: boolean
  minimal?: boolean
}

const placeholderTexts = [
  'Ask me what you need...',
  '¿Qué normativas de la CNBV aplican?',
  'Explícame los procedimientos de compliance',
  '¿Cómo funciona la gestión de riesgos?',
  'Políticas de onboarding de clientes',
  'Procedimientos contables y financieros',
  'Regulaciones de prevención de lavado',
  'Manuales operativos internos',
]

export function SearchInterface({
  onSearch,
  isLoading = false,
  minimal = false,
}: SearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false) // Nueva variable para controlar interacción
  // Filtros y chips
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    area: [] as string[],
    categoria: [] as string[],
    fuente: [] as string[],
    tags: [] as string[],
  })
  const [activeChips, setActiveChips] = useState<
    Array<{ key: string; value: string }>
  >([])

  // Typing animation effect
  useEffect(() => {
    // Solo mostrar la animación si el usuario no ha interactuado y no hay texto
    if (!query && !userInteracted) {
      const currentText = placeholderTexts[currentPlaceholder]
      setIsTyping(true)
      setDisplayedText('')

      let index = 0
      const typeText = () => {
        if (index <= currentText.length) {
          setDisplayedText(currentText.slice(0, index))
          index++
          setTimeout(typeText, 50 + Math.random() * 50) // Random typing speed
        } else {
          setIsTyping(false)
          // Wait before starting next text
          setTimeout(() => {
            setCurrentPlaceholder(
              (prev) => (prev + 1) % placeholderTexts.length
            )
          }, 2000)
        }
      }

      const timeout = setTimeout(typeText, 500)
      return () => clearTimeout(timeout)
    }
    // Si el usuario ha interactuado, limpiar el texto del placeholder
    else if (userInteracted) {
      setDisplayedText('')
      setIsTyping(false)
    }
  }, [currentPlaceholder, query, userInteracted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      // Enviar query y filtros
      onSearch({ query: query.trim(), filters })
      setQuery('')
    }
  }

  // Actualizar chips activos cuando cambian los filtros
  useEffect(() => {
    const chips: Array<{ key: string; value: string }> = []
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          chips.push({ key, value })
        })
      }
    })
    setActiveChips(chips)
  }, [filters])

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'es-ES'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  // If minimal mode, show only the input
  if (minimal) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => setUserInteracted(true)}
            onFocus={() => setUserInteracted(true)}
            onBlur={() => {
              // Reactivar la animación solo si el input está vacío
              if (!query.trim()) {
                setUserInteracted(false)
              }
            }}
            placeholder={displayedText + (isTyping ? '|' : '')}
            className="input-banking h-12 text-base pr-24 pl-4 rounded-xl"
            disabled={isLoading}
          />

          {/* Voice input button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-banking-primary"
            onClick={handleVoiceInput}
            disabled={isLoading || isListening}
          >
            {isListening ? (
              <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Filtro Drawer Trigger */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-24 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-banking-primary"
                onClick={() => setDrawerOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setDrawerOpen(false)}
              />
            </DrawerContent>
          </Drawer>

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 btn-banking-primary rounded-lg"
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {/* Chips de filtros activos */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activeChips.map((chip, idx) => (
              <Badge
                key={idx}
                className="bg-banking-primary text-white px-3 py-1 flex items-center gap-1"
              >
                {chip.key}: {chip.value}
                <button
                  type="button"
                  className="ml-1 text-xs text-white hover:text-red-400"
                  onClick={() => {
                    setActiveChips(activeChips.filter((_, i) => i !== idx))
                    setFilters((prev) => ({
                      ...prev,
                      [chip.key]: prev[chip.key].filter(
                        (v: string) => v !== chip.value
                      ),
                    }))
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Main greeting */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          What do you want to consult today...?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask me about regulatory laws, compliance manuals, operational
          procedures, or any banking documentation you need help with.
        </p>
      </div>

      {/* Search interface */}
      <Card className="card-banking p-6 animate-slide-in">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={() => setUserInteracted(true)}
              onFocus={() => setUserInteracted(true)}
              onBlur={() => {
                // Reactivar la animación solo si el input está vacío
                if (!query.trim()) {
                  setUserInteracted(false)
                }
              }}
              placeholder={displayedText + (isTyping ? '|' : '')}
              className="input-banking h-14 text-lg pr-32 pl-6 rounded-xl"
              disabled={isLoading}
            />

            {/* Voice input button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-24 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-banking-primary"
              onClick={handleVoiceInput}
              disabled={isLoading || isListening}
            >
              {isListening ? (
                <div className="h-5 w-5 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Filtro Drawer Trigger */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-banking-primary"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setDrawerOpen(false)}
                />
              </DrawerContent>
            </Drawer>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 btn-banking-primary rounded-lg"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Chips de filtros activos */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeChips.map((chip, idx) => (
            <Badge
              key={idx}
              className="bg-banking-primary text-white px-3 py-1 flex items-center gap-1"
            >
              {chip.key === 'tags'
                ? chip.value
                : `${chip.key.charAt(0).toUpperCase() + chip.key.slice(1)}: ${
                    chip.value
                  }`}
              <button
                type="button"
                className="ml-1 text-xs text-white hover:text-red-400"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    [chip.key]: prev[chip.key].filter(
                      (v: string) => v !== chip.value
                    ),
                  }))
                }}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Recent activity hint */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Your recent chats and documents are available in the sidebar</p>
      </div>
    </div>
  )
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition
    SpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
