import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (like sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    setError(error?.message ?? null)
    setLoading(false)
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setError(error?.message ?? null)
    setLoading(false)
    return { data, error }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signOut()
    setError(error?.message ?? null)
    setLoading(false)
    return { error }
  }

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
