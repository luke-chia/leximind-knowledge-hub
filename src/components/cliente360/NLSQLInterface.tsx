import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Mic, Loader2, Database, Clock, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface NLSQLInterfaceProps {
  onQuery?: (question: string) => void
  isLoading?: boolean
}

function getSpeechRecognition():
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition
  | undefined {
  if (typeof window !== 'undefined') {
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    )
  }
  return undefined
}

export function NLSQLInterface({ onQuery, isLoading = false }: NLSQLInterfaceProps) {
  const { t } = useTranslation()

  const placeholderTexts = useMemo(() => [
    'Dame información de los créditos vigentes de clientes llamados Juan Pérez',
    '¿Cuántos clientes tienen créditos vencidos?',
    'Muéstrame el saldo total de créditos por estatus',
    'Lista los créditos con monto mayor a 50000',
    '¿Cuál es el promedio de créditos por cliente?'
  ], [])

  const [question, setQuestion] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // Typing animation effect
  useEffect(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current = []

    if (!question && !userInteracted) {
      const currentText = placeholderTexts[currentPlaceholder]
      if (!currentText) return

      setIsTyping(true)
      setDisplayedText('')

      let index = 0
      const typeText = () => {
        if (index <= currentText.length) {
          setDisplayedText(currentText.slice(0, index))
          index++
          const timeout = setTimeout(typeText, 50 + Math.random() * 50)
          timeoutRefs.current.push(timeout)
        } else {
          setIsTyping(false)
          const timeout = setTimeout(() => {
            setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length)
          }, 2000)
          timeoutRefs.current.push(timeout)
        }
      }

      const initialTimeout = setTimeout(typeText, 500)
      timeoutRefs.current.push(initialTimeout)
    } else if (userInteracted) {
      setDisplayedText('')
      setIsTyping(false)
    }

    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
      timeoutRefs.current = []
    }
  }, [currentPlaceholder, question, placeholderTexts, userInteracted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return
    
    // Simular llamada al backend
    setShowResults(true)
    onQuery?.(question)
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      alert(t('voice_not_supported') || 'Voice recognition is not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuestion(transcript)
      setUserInteracted(true)
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

  // Mock data para demostración
  const mockResults = {
    question: "Dame información de los créditos vigentes de clientes llamados Karla Reyes",
    generatedSQL: "SELECT T1.MontoCredito, T1.SaldoCapVigent, T1.SaldoCapAtrasad, T1.SaldoCapVencido, T1.Estatus FROM microfinMexico.CREDITOS AS T1 JOIN microfinMexico.CLIENTES AS T2 ON T1.ClienteID = T2.ClienteID WHERE T2.NombreCompleto LIKE '%Karla Reyes%' AND T1.Estatus IN ('V', 'B')",
    results: [
      {
        MontoCredito: 100000.00,
        SaldoCapVigent: 0.00,
        SaldoCapAtrasad: 0.00,
        SaldoCapVencido: 45901.23,
        Estatus: "B"
      },
      {
        MontoCredito: 43000.00,
        SaldoCapVigent: 0.00,
        SaldoCapAtrasad: 0.00,
        SaldoCapVencido: 10750.03,
        Estatus: "B"
      }
    ],
    metadata: {
      rowCount: 2,
      executionTime: "245ms",
      tablesUsed: ["microfinMexico.CREDITOS", "microfinMexico.CLIENTES"],
      modelId: "meta.llama-3.3-70b-instruct"
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <Card className="card-banking p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                setUserInteracted(true)
              }}
              onFocus={() => setUserInteracted(true)}
              onBlur={() => {
                if (!question.trim()) {
                  setUserInteracted(false)
                }
              }}
              placeholder={displayedText + (isTyping ? '|' : '')}
              className="input-banking h-14 text-lg pr-24 pl-6 rounded-xl"
              disabled={isLoading}
            />

            {/* Voice input button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-14 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-banking-primary"
              onClick={handleVoiceInput}
              disabled={isLoading || isListening}
            >
              {isListening ? (
                <div className="h-5 w-5 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 btn-banking-primary rounded-lg"
              disabled={!question.trim() || isLoading}
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

      {/* Results Section (solo se muestra si showResults es true) */}
      {showResults && (
        <div className="space-y-6 animate-fade-in">
          {/* Question */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Pregunta</h3>
            </div>
            <p className="text-base text-foreground">{mockResults.question}</p>
          </Card>

          {/* Generated SQL */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">SQL Generado</h3>
            </div>
            <div className="bg-muted rounded-md p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
                {mockResults.generatedSQL}
              </code>
            </div>
          </Card>

          {/* Metadata */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Información de Ejecución</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registros</p>
                <p className="text-2xl font-semibold text-foreground">{mockResults.metadata.rowCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tiempo</p>
                <p className="text-2xl font-semibold text-foreground">{mockResults.metadata.executionTime}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Tablas Usadas</p>
                <div className="flex flex-wrap gap-2">
                  {mockResults.metadata.tablesUsed.map((table) => (
                    <Badge key={table} variant="secondary" className="text-sm py-1 px-3">
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="card-banking p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Resultados ({mockResults.metadata.rowCount})</h3>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-semibold">Monto Crédito</TableHead>
                    <TableHead className="text-sm font-semibold">Saldo Vigente</TableHead>
                    <TableHead className="text-sm font-semibold">Saldo Atrasado</TableHead>
                    <TableHead className="text-sm font-semibold">Saldo Vencido</TableHead>
                    <TableHead className="text-sm font-semibold">Estatus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResults.results.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        ${row.MontoCredito.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        ${row.SaldoCapVigent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        ${row.SaldoCapAtrasad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        ${row.SaldoCapVencido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.Estatus === 'V' ? 'default' : 'destructive'}>
                          {row.Estatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
