import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Mic, Loader2, Database, Clock, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="w-full space-y-6">
      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value)
                    setUserInteracted(true)
                  }}
                  placeholder={displayedText || 'Escribe tu pregunta en lenguaje natural...'}
                  className="pr-12 text-base"
                  disabled={isLoading}
                />
                {isTyping && !question && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-pulse">
                    |
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isLoading || isListening}
                className="shrink-0"
              >
                {isListening ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Button
                type="submit"
                size="icon"
                disabled={!question.trim() || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Consulta las tablas CLIENTES y CREDITOS usando lenguaje natural</span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section (solo se muestra si showResults es true) */}
      {showResults && (
        <div className="space-y-4 animate-fade-in">
          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Pregunta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{mockResults.question}</p>
            </CardContent>
          </Card>

          {/* Generated SQL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                SQL Generado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-4 overflow-x-auto">
                <code className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                  {mockResults.generatedSQL}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Información de Ejecución
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                  <p className="text-lg font-semibold text-foreground">{mockResults.metadata.rowCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo</p>
                  <p className="text-lg font-semibold text-foreground">{mockResults.metadata.executionTime}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Tablas Usadas</p>
                  <div className="flex flex-wrap gap-1">
                    {mockResults.metadata.tablesUsed.map((table) => (
                      <Badge key={table} variant="secondary" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultados ({mockResults.metadata.rowCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Monto Crédito</TableHead>
                      <TableHead>Saldo Vigente</TableHead>
                      <TableHead>Saldo Atrasado</TableHead>
                      <TableHead>Saldo Vencido</TableHead>
                      <TableHead>Estatus</TableHead>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
