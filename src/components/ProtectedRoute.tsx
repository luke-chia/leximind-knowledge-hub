import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-banking-primary" />
      </div>
    )
  }

  // If not authenticated, redirect to sign-in with the attempted location
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  // If authenticated, render the protected content
  return <>{children}</>
}