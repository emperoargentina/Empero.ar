import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { invalidateProductosCache } from '@/lib/productosCache'
import { Toaster, toast } from 'sonner'
import {
  Package, Menu, LogOut, RefreshCw,
  ChevronLeft,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface Props { session: Session }

const TABS = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/productos', label: 'Productos' },
]

function SidebarInner({
  onPurgeCache, purging, session,
}: {
  onPurgeCache: () => void
  purging: boolean
  session: Session
}) {
  return (
    <div className="flex flex-col h-full bg-[#1A1613]">
      <div className="relative px-5 pt-8 pb-6 flex-shrink-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#C41B2E]/5 blur-3xl pointer-events-none" />
        <div className="w-9 h-9 rounded-xl bg-[#C41B2E] flex items-center justify-center mb-4 shadow-lg shadow-[#C41B2E]/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-white font-semibold text-lg tracking-tight">Empero</h1>
        <p className="text-[#6B6159] text-[11px] font-medium uppercase tracking-[0.12em] mt-0.5">
          Panel administrativo
        </p>
        <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-[#C41B2E]/40 via-white/[0.06] to-transparent" />
      </div>

      <div className="flex-1" />

      <div className="px-3 py-4 space-y-1 flex-shrink-0 border-t border-white/[0.06]">
        <button
          onClick={onPurgeCache}
          disabled={purging}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#857870] hover:bg-white/[0.06] hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 flex-shrink-0 ${purging ? 'animate-spin' : ''}`} />
          {purging ? 'Reseteando...' : 'Resetear caché'}
        </button>

        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C41B2E]/20 to-[#C41B2E]/5 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#C41B2E]">
                {session.user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#857870] truncate font-medium">{session.user.email}</p>
              <p className="text-[9px] text-[#4A4540] uppercase tracking-[0.12em]">Sesión activa</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#857870] hover:bg-white/[0.06] hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function AdminPanel({ session }: Props) {
  const navigate              = useNavigate()
  const location              = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [purging, setPurging]       = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handlePurgeCache = useCallback(async () => {
    setPurging(true)
    invalidateProductosCache()

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'purge-image-cache' })
    }

    try {
      const secret = import.meta.env.VITE_REVALIDATE_SECRET
      if (secret) {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'x-revalidate-secret': secret },
        })
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('cache-purged'))
    toast.success('Caché reseteado · datos frescos de Supabase')
    setPurging(false)
  }, [])

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F0E8] via-[#FAF8F5] to-[#EDE8E0] flex">
      <Toaster richColors position="top-right" />

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#C41B2E]/[0.03] blur-[120px] pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C41B2E]/[0.02] blur-[100px] pointer-events-none -z-0" />

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block ${sidebarWidth} flex-shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300 border-r border-white/[0.04] z-10`}>
        <SidebarInner
          onPurgeCache={handlePurgeCache}
          purging={purging}
          session={session}
        />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A1613] border border-white/[0.06] flex items-center justify-center text-[#857870] hover:text-white transition-colors cursor-pointer z-20"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0 bg-[#1A1613]">
          <SidebarInner
            onPurgeCache={handlePurgeCache}
            purging={purging}
            session={session}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        <header className="bg-white/80 backdrop-blur-lg border-b border-[#EBE5DC] px-4 lg:px-8 h-16 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#9E9080] font-medium">Empero Admin</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0E8] rounded-lg text-[11px] text-[#6B6159] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {session.user.email}
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-[#EBE5DC] px-4 lg:px-8">
          <div className="flex gap-1">
            {TABS.map(tab => {
              const active = location.pathname === tab.path
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? 'text-[#C41B2E]'
                      : 'text-[#9E9080] hover:text-[#6B6159]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#C41B2E] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
