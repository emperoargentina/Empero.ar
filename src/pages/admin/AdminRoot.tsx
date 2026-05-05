// src/pages/admin/AdminRoot.tsx
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AdminLogin } from './AdminLogin'
import { AdminPanel } from './AdminPanel'

export function AdminRoot() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1613] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <AdminLogin />
  return <AdminPanel session={session} />
}
