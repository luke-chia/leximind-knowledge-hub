import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Upload, Star, Clock, Filter } from 'lucide-react'
import { DocumentUploadPanel } from '@/components/documents/DocumentUploadPanel'
import { DocumentPagination } from '@/components/documents/DocumentPagination'
import { useDocumentStats } from '@/hooks/useDocumentStats'
import { useDocuments } from '@/hooks/useDocuments'

const Documents = () => {
  const { t } = useTranslation()
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false)
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    formatLastUpdated,
    formatSizeMB,
  } = useDocumentStats()
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    currentPage,
    totalPages,
    totalDocuments: apiTotalDocuments,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  } = useDocuments()

  return (
    <MainLayout>
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">
              Manage and access your document library
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="btn-banking-ghost">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              className="btn-banking-primary"
              onClick={() => setUploadPanelOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('documents.stats.total_documents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-banking-primary">
                  {stats?.totalDocuments || 0}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('documents.stats.total_size')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-banking-secondary">
                  {stats ? formatSizeMB(stats.totalSizeMB) : '0 MB'}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('documents.stats.average_size')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-banking-accent">
                  {stats ? formatSizeMB(stats.averageSizeMB) : '0 MB'}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('documents.stats.last_updated')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {stats ? formatLastUpdated(stats.lastUpdated) : 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Paginación */}
        <DocumentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalDocuments={apiTotalDocuments}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoToPage={goToPage}
        />

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentsLoading ? (
            // Skeleton loading para documentos
            Array.from({ length: 9 }).map((_, index) => (
              <Card key={index} className="card-banking">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : documentsError ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground mb-4">
                {t('documents.list.error_loading')}: {documentsError}
              </p>
              <Button onClick={refetch} variant="outline">
                {t('documents.list.retry')}
              </Button>
            </div>
          ) : documents.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('documents.list.no_documents')}
              </p>
            </div>
          ) : (
            // Documents list
            documents.map((doc) => (
              <Card
                key={doc.id}
                className="card-banking group cursor-pointer hover:shadow-banking transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-banking-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {doc.type}
                      </Badge>
                    </div>
                    {doc.favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-banking-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.department}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{doc.lastOpened}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Document Upload Panel */}
        <DocumentUploadPanel
          open={uploadPanelOpen}
          onOpenChange={setUploadPanelOpen}
        />
      </div>
    </MainLayout>
  )
}

export default Documents
