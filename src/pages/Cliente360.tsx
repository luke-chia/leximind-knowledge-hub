import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export default function Cliente360() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('sidebar.cliente_360')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vista de Cliente 360</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás visualizar la información completa del cliente, incluyendo
              datos personales, productos contratados, historial de transacciones y más.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
