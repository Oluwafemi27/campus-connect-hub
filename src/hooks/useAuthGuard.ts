import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthGuard() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Only redirect once we've finished loading and confirmed no user exists
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, loading, navigate])

  // Return loading state so components can show a loading state if needed
  return { isLoading: loading, isAuthenticated: !!user }
}
