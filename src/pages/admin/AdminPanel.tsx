// src/pages/admin/AdminPanel.tsx
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { invalidateProductosCache } from '@/lib/productosCache'
import { Toaster, toast } from 'sonner'
import {
  LayoutDashboard, Package, Menu, LogOut, ChevronRight, RefreshCw,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Dashboard } from './views/Dashboard'
import { Products } from './views/Products'

export type AdminView = 'dashboard' | 'products'

interface Props { session: Session }

export function AdminPanel({ session }: Props) {
  const [view, setView]             = useState<AdminView>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [purging, setPurging]       = useState(false)
  // Incrementar para forzar remount de la vista activa tras reset
  const [cacheKey, setCacheKey]     = useState(0)

  const handleLogout = () => supabase.auth.signOut()

  const handlePurgeCache = async () => {
    setPurging(true)

    // 1. Invalidar caché local de localStorage
    invalidateProductosCache()

    // 2. Intentar purgar CDN de Vercel (no fatal si no hay token)
    try {
      const secret = import.meta.env.VITE_REVALIDATE_SECRET
      if (secret) {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'x-revalidate-secret': secret },
        })
      }
    } catch {
      // Non-fatal
    }

    // 3. Forzar remount de la vista → refetch de Supabase
    setCacheKey(k => k + 1)
    toast.success('Caché reseteado · datos frescos de Supabase')
    setPurging(false)
  }

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products'  as AdminView, label: 'Productos', icon: Package },
  ]

  const viewLabels: Record<AdminView, string> = {
    dashboard: 'Dashboard',
    products:  'Productos',
  }

  const SidebarInner = () => (
    <div className="flex flex-col h-full bg-[#1A1613]">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/[0.06] flex-shrink-0">
        <img src="/images/logo/Logo.png" alt="Empero" className="h-7 w-auto brightness-0 invert" />
        <p className="text-[10px] text-[#4A4540] uppercase tracking-[0.15em] mt-2 font-medium">
          Panel Administrativo
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-[#C41B2E] text-white shadow-sm shadow-[rgba(196,27,46,0.3)]'
                  : 'text-[#857870] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </button>
          )
        })}
      </nav>

      {/* Cache + User */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1 flex-shrink-0">
        <button
          onClick={handlePurgeCache}
          disabled={purging}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#857870] hover:bg-white/[0.06] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 flex-shrink-0 ${purging ? 'animate-spin' : ''}`} />
          {purging ? 'Reseteando...' : 'Resetear caché'}
        </button>

        <div className="px-3 pt-2 pb-1">
          <p className="text-[10px] text-[#4A4540] uppercase tracking-[0.12em] mb-0.5">Sesión activa</p>
          <p className="text-xs text-[#857870] truncate">{session.user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#857870] hover:bg-white/[0.06] hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F0E8] flex">
      <Toaster richColors position="top-right" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-0 h-screen overflow-hidden border-r border-white/[0.04]">
        <SidebarInner />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0">
          <SidebarInner />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[#EBE5DC] px-4 lg:px-6 h-14 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10">
          <button
            className="lg:hidden p-2 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#9E9080]">Empero Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C0B5A8]" />
            <span className="text-[#1A1613] font-semibold">{viewLabels[view]}</span>
          </div>
        </header>

        {/* View content — key={cacheKey} fuerza remount tras reset */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {view === 'dashboard' && <Dashboard key={cacheKey} onNavigate={setView} />}
          {view === 'products'  && <Products  key={cacheKey} />}
        </main>
      </div>
    </div>
  )
}
