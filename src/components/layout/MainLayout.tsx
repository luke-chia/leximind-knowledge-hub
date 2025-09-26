import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { PDFViewerManager } from '@/components/pdf/PDFViewerManager'

interface MainLayoutProps {
  children: React.ReactNode
  onNewChat?: () => void // Ahora completamente opcional - el botón funciona sin este callback
}

export function MainLayout({ children, onNewChat }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onNewChat={onNewChat} />

          <main className="flex-1 banking-pattern relative">
            {/* Sidebar trigger for mobile */}
            <div className="md:hidden absolute top-4 left-4 z-10">
              <SidebarTrigger className="h-10 w-10" />
            </div>

            <div className="h-full flex items-center justify-center p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* PDF Viewer Modal Global */}
      <PDFViewerManager />
    </SidebarProvider>
  )
}
