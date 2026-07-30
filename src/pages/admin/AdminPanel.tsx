import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { invalidateProductosCache } from '@/lib/productosCache'
import { Toaster, toast } from 'sonner'
import {
  Package, Menu, LogOut, RefreshCw,
  ChevronLeft, LayoutDashboard, Star,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface Props { session: Session }

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/productos', label: 'Productos', icon: Package },
  { path: '/admin/destacados', label: 'Destacados', icon: Star },
]

function SidebarInner({
  onPurgeCache, purging, session, collapsed,
}: {
  onPurgeCache: () => void
  purging: boolean
  session: Session
  collapsed?: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#EBE5DC]">
      <div className={`relative px-5 pt-8 pb-6 flex-shrink-0 overflow-hidden ${collapsed ? 'px-3' : ''}`}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#C41B2E]/5 blur-3xl pointer-events-none" />
        <div className="w-9 h-9 rounded-xl bg-[#C41B2E] flex items-center justify-center mb-4 shadow-lg shadow-[#C41B2E]/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <>
            <h1 className="text-[#1A1613] font-semibold text-lg tracking-tight">Empero</h1>
            <p className="text-[#9E9080] text-[11px] font-medium uppercase tracking-[0.12em] mt-0.5">
              Panel administrativo
            </p>
          </>
        )}
        <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-[#C41B2E]/30 via-[#EBE5DC] to-transparent" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-[#FFF0F1] text-[#C41B2E]'
                  : 'text-[#6B6159] hover:bg-[#F4F0E8] hover:text-[#1A1613]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C41B2E]' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 space-y-1 flex-shrink-0 border-t border-[#EBE5DC]">
        <button
          onClick={onPurgeCache}
          disabled={purging}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B6159] hover:bg-[#F4F0E8] hover:text-[#1A1613] transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 flex-shrink-0 ${purging ? 'animate-spin' : ''}`} />
          {!collapsed && (purging ? 'Reseteando...' : 'Resetear caché')}
        </button>

        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C41B2E]/15 to-[#C41B2E]/5 border border-[#EBE5DC] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#C41B2E]">
                  {session.user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#6B6159] truncate font-medium">{session.user.email}</p>
                <p className="text-[9px] text-[#9E9080] uppercase tracking-[0.12em]">Sesión activa</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B6159] hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}

export function AdminPanel({ session }: Props) {
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

      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#C41B2E]/[0.03] blur-[120px] pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C41B2E]/[0.02] blur-[100px] pointer-events-none -z-0" />

      <aside className={`hidden lg:block ${sidebarWidth} flex-shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300 border-r border-[#EBE5DC] z-10`}>
        <SidebarInner
          onPurgeCache={handlePurgeCache}
          purging={purging}
          session={session}
          collapsed={sidebarCollapsed}
        />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#EBE5DC] shadow-sm flex items-center justify-center text-[#9E9080] hover:text-[#C41B2E] transition-colors cursor-pointer z-20"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0 bg-white">
          <SidebarInner
            onPurgeCache={handlePurgeCache}
            purging={purging}
            session={session}
          />
        </SheetContent>
      </Sheet>

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
            <span className="text-[#C0B5A8] mx-1">·</span>
            <span className="text-[#6B6159]">
              {NAV.find(t => location.pathname === t.path)?.label || 'Admin'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0E8] rounded-lg text-[11px] text-[#6B6159] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {session.user.email}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
