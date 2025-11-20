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
      <div className="container mx-auto px-6 pt-8 pb-6 max-w-7xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('sidebar.cliente_360')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consulta información de clientes y créditos usando lenguaje natural
          </p>
        </div>

        <NLSQLInterface onQuery={handleQuery} />
      </div>
    </MainLayout>
  )
}
