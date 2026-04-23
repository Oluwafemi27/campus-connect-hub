import { useState, useEffect } from 'react'
import { useSupabaseAuth } from './useSupabaseAuth'

export function useIsAdmin() {
  const { user } = useSupabaseAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    // Check if user has admin role in app_metadata
    const adminStatus = user.app_metadata?.role === 'admin'
    setIsAdmin(adminStatus)
  }, [user])

  return isAdmin
}
