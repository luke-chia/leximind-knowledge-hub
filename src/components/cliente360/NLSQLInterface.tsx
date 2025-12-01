import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Send,
  Mic,
  Loader2,
  Database,
  Clock,
  Code,
  Download,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NLSQLResponse } from '@/services/nlsql'

interface NLSQLInterfaceProps {
  onQuery?: (question: string) => Promise<void> | void
  isLoading?: boolean
  loading?: boolean
  error?: string | null
  response?: NLSQLResponse | null
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

export function NLSQLInterface({
  onQuery,
  isLoading = false,
  loading = false,
  error = null,
  response = null,
}: NLSQLInterfaceProps) {
  const { t } = useTranslation()

  // Determinar si está cargando desde cualquiera de las props
  const actualLoading = isLoading || loading

  const placeholderTexts = useMemo(
    () => [
      'Dame informacion de los creditos vigentes de los clientes que su nombre es parecido a Karla Reyes',
      '¿Cuántos clientes tienen créditos vencidos?',
      'Muéstrame el saldo total de créditos por estatus',
      'Lista los créditos con monto mayor a $50,000',
      '¿Cuál es el promedio en monto y número de créditos por cliente?',
    ],
    []
  )

  const [question, setQuestion] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

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
            setCurrentPlaceholder(
              (prev) => (prev + 1) % placeholderTexts.length
            )
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
    if (!question.trim() || actualLoading) return

    onQuery?.(question)
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      alert(
        t('voice_not_supported') ||
          'Voice recognition is not supported in this browser'
      )
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: {
      results: { [key: number]: { [key: number]: { transcript: string } } }
    }) => {
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

  // Funciones de exportación
  const formatValueForExport = (key: string, value: unknown): string => {
    const keyLower = key.toLowerCase()

    // Función para determinar si es un número ID o código
    const isNumericIdentifier = (val: unknown): boolean => {
      return (
        typeof val === 'number' &&
        (keyLower.includes('numero') ||
          keyLower.includes('num') ||
          keyLower.includes('id') ||
          keyLower.includes('codigo') ||
          keyLower.includes('cliente') ||
          keyLower.includes('cuenta') ||
          keyLower.includes('folio'))
      )
    }

    // Función para determinar si es un monto monetario
    const isMonetaryAmount = (val: unknown): boolean => {
      return (
        typeof val === 'number' &&
        !isNumericIdentifier(val) &&
        (val % 1 !== 0 ||
          keyLower.includes('saldo') ||
          keyLower.includes('monto') ||
          keyLower.includes('precio') ||
          keyLower.includes('pago') ||
          keyLower.includes('credito') ||
          keyLower.includes('capital') ||
          keyLower.includes('interes') ||
          keyLower.includes('comision'))
      )
    }

    if (isNumericIdentifier(value)) {
      return Number(value).toLocaleString('es-MX')
    } else if (isMonetaryAmount(value)) {
      return `$${Number(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    return String(value)
  }

  const exportToCSV = () => {
    if (!response?.results?.length) return

    const headers = Object.keys(response.results[0])
    const csvContent = [
      headers.join(','),
      ...response.results.map((row) =>
        headers
          .map((header) => {
            const value = formatValueForExport(header, row[header])
            // Escapar comillas y envolver en comillas si contiene comas
            return value.includes(',') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"`
              : value
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `consulta_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  const exportToExcel = () => {
    if (!response?.results?.length) return

    const headers = Object.keys(response.results[0])
    const rows = response.results.map((row) =>
      headers.map((header) => formatValueForExport(header, row[header]))
    )

    // Crear contenido HTML para Excel
    const htmlContent = `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `consulta_${new Date().toISOString().slice(0, 10)}.xls`
    link.click()
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <Card className="card-banking p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Textarea
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
              onKeyDown={(e) => {
                // Enviar con Enter, pero permitir Shift+Enter para nueva línea
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder={displayedText + (isTyping ? '|' : '')}
              className="input-banking min-h-[120px] max-h-48 text-lg px-6 py-4 rounded-xl resize-none overflow-y-auto"
              disabled={actualLoading}
              rows={4}
            />

            {/* Botones de control */}
            <div className="flex justify-end gap-3">
              {/* Voice input button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-banking-primary"
                onClick={handleVoiceInput}
                disabled={actualLoading || isListening}
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
                className="h-10 w-10 btn-banking-primary rounded-lg"
                disabled={!question.trim() || actualLoading}
              >
                {actualLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Error Section */}
      {error && (
        <Card className="card-banking p-6 border-destructive">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-destructive">Error</h3>
          </div>
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Results Section */}
      {response && (
        <div className="space-y-6 animate-fade-in">
          {/* Question */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Pregunta</h3>
            </div>
            <p className="text-base text-foreground">{response.question}</p>
          </Card>

          {/* Generated SQL */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">SQL Generado</h3>
            </div>
            <div className="bg-muted rounded-md p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
                {response.generatedSQL}
              </code>
            </div>
          </Card>

          {/* Metadata */}
          <Card className="card-banking p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Información de Ejecución
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registros</p>
                <p className="text-2xl font-semibold text-foreground">
                  {response.metadata.rowCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tiempo</p>
                <p className="text-2xl font-semibold text-foreground">
                  {response.metadata.executionTime}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Tablas Usadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {response.metadata.tablesUsed.map((table) => (
                    <Badge
                      key={table}
                      variant="secondary"
                      className="text-sm py-1 px-3"
                    >
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Results Table */}
          {response.results.length > 0 && (
            <Card className="card-banking p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Resultados ({response.metadata.rowCount})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToExcel}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(response.results[0]).map((column) => (
                        <TableHead
                          key={column}
                          className="text-sm font-semibold"
                        >
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response.results.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.entries(row).map(([key, value]) => {
                          // Función helper para detectar si es un valor numérico (number o string numérico)
                          const isNumericValue = (val: unknown): boolean => {
                            return (
                              typeof val === 'number' ||
                              (typeof val === 'string' &&
                                !isNaN(Number(val)) &&
                                val.trim() !== '')
                            )
                          }

                          // Función helper para convertir a número
                          const toNumber = (val: unknown): number => {
                            return typeof val === 'number'
                              ? val
                              : parseFloat(String(val))
                          }

                          // Función para determinar si es un número ID o código
                          const isNumericIdentifier = (
                            val: unknown
                          ): boolean => {
                            if (!isNumericValue(val)) return false
                            const keyLower = key.toLowerCase()

                            // PRIORIDAD: Verificar primero si contiene palabras monetarias
                            const monetaryKeywords = [
                              'saldo',
                              'monto',
                              'precio',
                              'pago',
                              'credito',
                              'capital',
                              'interes',
                              'comision',
                              'vigent',
                              'atrasad',
                              'vencido',
                            ]
                            const hasMonetaryKeyword = monetaryKeywords.some(
                              (keyword) => keyLower.includes(keyword)
                            )
                            if (hasMonetaryKeyword) {
                              console.log(
                                `PRIORIDAD MONETARIA: "${key}" contiene palabra monetaria, NO es identificador`
                              )
                              return false // Si es monetario, NO es identificador
                            }

                            const identifierKeywords = [
                              'numero',
                              'num',
                              'id',
                              'codigo',
                              'cliente',
                              'cuenta',
                              'folio',
                            ]

                            const matchedKeyword = identifierKeywords.find(
                              (keyword) => keyLower.includes(keyword)
                            )
                            if (matchedKeyword) {
                              console.log(
                                `IDENTIFICADOR DETECTADO: "${key}" contiene "${matchedKeyword}"`
                              )
                            }

                            return (
                              keyLower.includes('numero') ||
                              keyLower.includes('num') ||
                              keyLower.includes('id') ||
                              keyLower.includes('codigo') ||
                              keyLower.includes('cliente') ||
                              keyLower.includes('cuenta') ||
                              keyLower.includes('folio')
                            )
                          }

                          // Función para determinar si es un monto monetario
                          const isMonetaryAmount = (val: unknown): boolean => {
                            if (!isNumericValue(val)) return false
                            if (isNumericIdentifier(val)) return false

                            const keyLower = key.toLowerCase()
                            const numValue = toNumber(val)

                            // Lista específica de palabras clave monetarias
                            const monetaryKeywords = [
                              'saldo',
                              'monto',
                              'precio',
                              'pago',
                              'credito',
                              'capital',
                              'interes',
                              'comision',
                              'vigent',
                              'atrasad',
                              'vencido',
                            ]

                            // Verificar si contiene alguna palabra clave monetaria
                            const hasMonetaryKeyword = monetaryKeywords.some(
                              (keyword) => keyLower.includes(keyword)
                            )

                            // Es monetario si: tiene decimales O contiene palabras clave monetarias
                            return numValue % 1 !== 0 || hasMonetaryKeyword
                          }

                          console.log(
                            `DEBUG - Columna: "${key}" | Valor: ${value} | Tipo: ${typeof value} | esNumerico: ${isNumericValue(
                              value
                            )} | esMonetario: ${isMonetaryAmount(
                              value
                            )} | esIdentificador: ${isNumericIdentifier(value)}`
                          )

                          return (
                            <TableCell key={key}>
                              {isNumericIdentifier(value)
                                ? toNumber(value).toLocaleString('es-MX')
                                : isMonetaryAmount(value)
                                ? `$${toNumber(value).toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : String(value)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
