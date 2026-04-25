import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return
      if (error) setError(error.message)
      setSession(session)
      setUser(session?.user ?? null)
      setAuthLoading(false)
    }).catch((_err) => {
      if (!isMounted) return
      setError('Failed to load session')
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    setActionLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setError(error?.message ?? null)
      return { data, error }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMsg)
      return { data: null, error: new Error(errorMsg) }
    } finally {
      setActionLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setActionLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setError(error?.message ?? null)
      return { data, error }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMsg)
      return { data: null, error: new Error(errorMsg) }
    } finally {
      setActionLoading(false)
    }
  }

  const signOut = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      setError(error?.message ?? null)
      return { error }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMsg)
      return { error: new Error(errorMsg) }
    } finally {
      setActionLoading(false)
    }
  }

  return {
    user,
    session,
    loading: authLoading || actionLoading,
    authLoading,
    actionLoading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
