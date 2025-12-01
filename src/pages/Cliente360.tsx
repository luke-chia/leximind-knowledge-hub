import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/MainLayout'
import { Database } from 'lucide-react'
import { NLSQLInterface } from '@/components/cliente360/NLSQLInterface'
import { useNLSQL } from '@/hooks/useNLSQL'
import { useToast } from '@/hooks/use-toast'

export default function Cliente360() {
  const { t } = useTranslation()
  const { executeQuery, loading, error, response, clearError } = useNLSQL()
  const { toast } = useToast()

  const handleQuery = async (question: string) => {
    console.log('Query received:', question)

    try {
      clearError()
      const result = await executeQuery(question)

      if (result) {
        console.log('Query result:', result)

        // Mostrar toast de éxito
        toast({
          title: 'Consulta ejecutada exitosamente',
          description: `Se encontraron ${result.metadata.rowCount} registros en ${result.metadata.executionTime}`,
        })
      }
    } catch (err) {
      console.error('Error executing query:', err)

      // Mostrar toast de error
      toast({
        variant: 'destructive',
        title: 'Error en la consulta',
        description:
          error ||
          'No se pudo ejecutar la consulta. Por favor intenta de nuevo.',
      })
    }
  }

  return (
    <MainLayout>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('cliente360_greeting')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('cliente360_description')}
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto px-6">
          <NLSQLInterface
            onQuery={handleQuery}
            loading={loading}
            error={error}
            response={response}
          />
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t('cliente360_hint')}
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
