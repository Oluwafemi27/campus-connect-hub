import { redirect } from '@tanstack/react-router'
import { supabase } from './supabase'

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    throw redirect({
      to: '/login',
      replace: true,
    })
  }

  return session.user
}

export async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    throw redirect({
      to: '/login',
      replace: true,
    })
  }

  const isAdmin = session.user.app_metadata?.role === 'admin'
  
  if (!isAdmin) {
    throw redirect({
      to: '/',
      replace: true,
    })
  }

  return session.user
}
