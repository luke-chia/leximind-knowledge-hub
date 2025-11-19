import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Index from './pages/Index'
import Search from './pages/Search'
import Cliente360 from './pages/Cliente360'
import Documents from './pages/Documents'
import Users from './pages/Users'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { useEffect } from 'react'
import { PDFViewerProvider } from '@/contexts/PDFViewerContext'
import { AppInitializer } from '@/components/AppInitializer'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const queryClient = new QueryClient()

const App = () => {
  useEffect(() => {
    // Ensure dark mode is enabled by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <AppInitializer>
            <TooltipProvider>
              <PDFViewerProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/" element={<SignIn />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/search"
                      element={
                        <ProtectedRoute>
                          <Search />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cliente-360"
                      element={
                        <ProtectedRoute>
                          <Cliente360 />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute>
                          <Documents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </PDFViewerProvider>
            </TooltipProvider>
          </AppInitializer>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
