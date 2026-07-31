import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { invalidateProductosCache } from '@/lib/productosCache'
import { Toaster, toast } from 'sonner'
import {
  Package, LogOut, RefreshCw,
  ChevronLeft, LayoutDashboard, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail,
  SidebarSeparator, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar'

interface Props { session: Session }

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/productos', label: 'Productos', icon: Package },
  { path: '/admin/destacados', label: 'Destacados', icon: Star },
]

function SidebarCollapseButton() {
  const { state, toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="hidden lg:inline-flex w-7 h-7 shrink-0 text-white/60 hover:text-white hover:bg-white/10"
    >
      <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${state === 'collapsed' ? 'rotate-180' : ''}`} />
    </Button>
  )
}

function SidebarInner({
  onPurgeCache, purging,
}: {
  onPurgeCache: () => void
  purging: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <>
      <SidebarHeader>
        <div className={`relative overflow-hidden ${collapsed ? 'px-1 py-4' : 'px-4 pt-6 pb-5'}`}>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src="/images/logo/Logo.png"
                alt="Empero"
                width={480}
                height={333}
                className="w-auto h-9 object-contain brightness-0 invert select-none"
              />
              <SidebarCollapseButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src="/images/logo/Logo.png"
                alt="Empero"
                width={480}
                height={333}
                className="w-auto h-10 object-contain brightness-0 invert select-none flex-shrink-0"
              />
              <p className="min-w-0 flex-1 text-white/50 text-[11px] font-medium uppercase tracking-[0.14em] truncate">
                Panel administrativo
              </p>
              <SidebarCollapseButton />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(item => {
                const active = location.pathname === item.path
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      onClick={() => navigate(item.path)}
                      className={`rounded-lg px-3 py-2.5 h-auto text-sm font-medium ${
                        active
                          ? 'bg-white text-[#C41B2E] hover:bg-white hover:text-[#C41B2E] shadow-md shadow-black/10'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-4" />
        <div className="px-3 pb-5 pt-3">
          <SidebarMenu className="items-center gap-1.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={purging ? 'Reseteando...' : 'Resetear caché'}
                onClick={onPurgeCache}
                disabled={purging}
                className="w-44 justify-center rounded-lg px-5 py-2.5 h-auto text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className={purging ? 'animate-spin' : ''} />
                <span>{purging ? 'Reseteando...' : 'Resetear caché'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Cerrar sesión"
                onClick={() => supabase.auth.signOut()}
                className="w-44 justify-center rounded-lg border border-white/30 px-5 py-2.5 h-auto text-sm font-medium text-white hover:bg-white/10 hover:border-white/60"
              >
                <LogOut />
                <span>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </>
  )
}

export function AdminPanel({ session }: Props) {
  const location = useLocation()
  const [purging, setPurging] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F0E8] via-[#FAF8F5] to-[#EDE8E0]">
      <Toaster richColors position="top-right" />

      <SidebarProvider>
        <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#C41B2E]/[0.03] blur-[120px] pointer-events-none -z-0" />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C41B2E]/[0.02] blur-[100px] pointer-events-none -z-0" />

        <Sidebar collapsible="icon" className="border-r border-white/10">
          <SidebarInner
            onPurgeCache={handlePurgeCache}
            purging={purging}
          />
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="relative bg-transparent">
          <header className="bg-white/80 backdrop-blur-lg border-b border-[#EBE5DC] px-4 lg:px-8 h-16 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="lg:hidden text-[#6B6159] hover:bg-[#F4F0E8] w-9 h-9" />

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
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
