import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Index from './pages/Index'
import Search from './pages/Search'
import Documents from './pages/Documents'
import Users from './pages/Users'
import NotFound from './pages/NotFound'
import { useEffect } from 'react'
import { PDFViewerProvider } from '@/contexts/PDFViewerContext'
import { AppInitializer } from '@/components/AppInitializer'

const queryClient = new QueryClient()

const App = () => {
  useEffect(() => {
    // Ensure dark mode is enabled by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <TooltipProvider>
          <PDFViewerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<SignIn />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/users" element={<Users />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PDFViewerProvider>
        </TooltipProvider>
      </AppInitializer>
    </QueryClientProvider>
  )
}

export default App
