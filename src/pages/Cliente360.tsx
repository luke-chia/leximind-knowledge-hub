import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/MainLayout'
import { Database } from 'lucide-react'
import { NLSQLInterface } from '@/components/cliente360/NLSQLInterface'

export default function Cliente360() {
  const { t } = useTranslation()

  const handleQuery = (question: string) => {
    console.log('Query received:', question)
    // Aquí se integrará el backend más adelante
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('sidebar.cliente_360')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consulta información de clientes y créditos usando lenguaje natural
            </p>
          </div>
        </div>

        <NLSQLInterface onQuery={handleQuery} />
      </div>
    </MainLayout>
  )
}
