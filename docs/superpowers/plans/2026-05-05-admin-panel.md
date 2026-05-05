# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality admin panel at `/admin` with Supabase auth, full product CRUD, stock alerts, and Vercel edge caching for the public catalog.

**Architecture:** Vite React SPA extended with React Router. `/admin` route renders `AdminRoot` which checks Supabase session — unauthenticated → `AdminLogin`, authenticated → `AdminPanel`. Admin CRUD uses the existing anon-key Supabase client (auth JWT included automatically, RLS guards). Public product catalog is served from a Vercel Edge Function at `/api/products` with `s-maxage=1800` cache. A protected `/api/revalidate` endpoint purges that cache on demand.

**Tech Stack:** react-router-dom v6, @supabase/supabase-js (already installed), shadcn/ui (Dialog, Sheet, Badge, Tabs — all installed), react-hook-form + zod (already installed), Sonner toasts (already installed), Lucide React, Vercel Edge Functions

---

## Env Vars Required

Before starting, add these to `.env.local` AND to Vercel project settings:

```bash
# Existing (already in .env.local):
VITE_SUPABASE_URL=https://ujfeannqsiatavnarrhf.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>

# New — server-side only (Vercel functions, never exposed to client):
SUPABASE_URL=https://ujfeannqsiatavnarrhf.supabase.co   # same value as VITE_
SUPABASE_SERVICE_KEY=<from notas.txt>

# New — cache purge secret (generate: openssl rand -base64 32):
REVALIDATE_SECRET=<random string>

# Optional — enables actual Vercel CDN purge (get from vercel.com/account):
VERCEL_TOKEN=<your vercel token>
```

## Supabase Auth Setup (one-time, in Supabase Dashboard)

1. Go to **Authentication → Users → Invite user** and add the admin email.
2. Go to **Authentication → Providers → Email** → disable "Enable email signup" (only invites).
3. Go to **Table Editor → productos → RLS** → add policy:
   - Name: `Allow authenticated full access`
   - Target: `ALL`
   - Check: `(auth.role() = 'authenticated')`

---

## File Map

```
NEW:
  api/products.ts                            Vercel Edge Function — cached public catalog
  api/revalidate.ts                          Vercel Edge Function — cache purge (protected)
  vercel.json                                SPA rewrites
  src/types/producto.ts                      TypeScript types for Supabase productos table
  src/router.tsx                             React Router routes
  src/pages/admin/AdminRoot.tsx              Auth gate (session check)
  src/pages/admin/AdminLogin.tsx             Login page
  src/pages/admin/AdminPanel.tsx             Sidebar layout shell + Sonner
  src/pages/admin/views/Dashboard.tsx        Stats cards + low-stock alerts
  src/pages/admin/views/Products.tsx         Products table + toolbar + pagination
  src/pages/admin/modals/ProductModal.tsx    Add/edit product form (react-hook-form + zod)

MODIFY:
  vite.config.ts                             base: './' → base: '/'
  src/main.tsx                               Render RouterApp instead of App directly
```

---

## Task 1: Routing Infrastructure

**Files:**
- Create: `vercel.json`
- Modify: `vite.config.ts` (line 8, base field)
- Create: `src/router.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install react-router-dom**

```bash
cd "D:\Juanchydo\Desktop\Empero.ar"
npm install react-router-dom
```

Expected: `added 1 package` (or similar). `react-router-dom` is now in `node_modules`.

- [ ] **Step 2: Create `vercel.json`**

Create `vercel.json` at project root:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ]
}
```

- [ ] **Step 3: Update `vite.config.ts`**

Change `base: './'` to `base: '/'`:

```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
```

- [ ] **Step 4: Create `src/router.tsx`**

```typescript
// src/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { AdminRoot } from './pages/admin/AdminRoot'

export function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminRoot />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Update `src/main.tsx`**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterApp } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterApp />
  </StrictMode>,
)
```

- [ ] **Step 6: Create `src/pages/admin/AdminRoot.tsx` (stub)**

Create the directory and a minimal stub so TypeScript can resolve the import:

```typescript
// src/pages/admin/AdminRoot.tsx
export function AdminRoot() {
  return <div>Admin (placeholder)</div>
}
```

- [ ] **Step 7: Verify TypeScript + dev server**

```bash
npx tsc --noEmit
npm run dev
```

Expected: No TS errors. Navigate to `http://localhost:5173/` → main site works. Navigate to `http://localhost:5173/admin` → shows "Admin (placeholder)".

- [ ] **Step 8: Commit**

```bash
git add vercel.json vite.config.ts src/router.tsx src/main.tsx src/pages/admin/AdminRoot.tsx package.json package-lock.json
git commit -m "feat: add react-router and /admin route scaffolding"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/producto.ts`

- [ ] **Step 1: Create `src/types/producto.ts`**

```typescript
// src/types/producto.ts

export interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria: string
  precio_usd: number | null
  stock: number
  disponible: boolean
  modo_disponibilidad: 'en_stock' | 'por_encargo'
  cloudinary_image_id: string | null
  cloudinary_url: string | null
  voltaje: string | null
  peso_kg: number | null
  volumen_m3: number | null
  capacidad: string | null
  motor_rpm: number | null
  dimensiones_canasto_mm: string | null
  dimensiones_mm: { Ancho?: number; Profundidad?: number; Alto?: number } | null
  potencias_kw: Record<string, number> | null
  temperaturas_c: Record<string, number> | null
  programas: { Cantidad?: number; Tiempos_segundos?: number[] } | null
  accesorios_incluidos: string[] | null
  caracteristicas_generales: string[] | null
  created_at: string
  updated_at: string
}

export type ProductoInsert = Omit<Producto, 'id' | 'created_at' | 'updated_at'>
export type ProductoUpdate = Partial<ProductoInsert>

export const CATEGORIAS = [
  'Lavado',
  'Refrigeración',
  'Distribución y Autoservicio',
  'Hornos',
  'Freidoras',
  'Planchas',
  'Cocinas',
  'Parrillas',
  'Cucipastas',
  'Hornos a Gas Bajo Mostrador',
  'Superficies',
  'Elaboración',
  'Mesas',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const LOW_STOCK_THRESHOLD = 5
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/producto.ts
git commit -m "feat: add Producto TypeScript type matching Supabase schema"
```

---

## Task 3: Vercel API Layer (Cached Products + Revalidate)

**Files:**
- Create: `api/products.ts`
- Create: `api/revalidate.ts`

- [ ] **Step 1: Create `api/products.ts`**

```typescript
// api/products.ts
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600',
      ...cors,
    },
  })
}
```

- [ ] **Step 2: Create `api/revalidate.ts`**

```typescript
// api/revalidate.ts
export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const secret = req.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Attempt Vercel CDN purge (non-fatal if VERCEL_TOKEN not set)
  const vercelToken = process.env.VERCEL_TOKEN
  if (vercelToken) {
    const origin = new URL(req.url).origin
    try {
      await fetch('https://api.vercel.com/v1/edge-cache/purge', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries: [`${origin}/api/products`] }),
      })
    } catch {
      // Non-fatal — cache expires naturally at s-maxage
    }
  }

  return new Response(
    JSON.stringify({ revalidated: true, timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: Zero errors (the `api/` files are excluded from `tsconfig.app.json` but shouldn't cause issues).

- [ ] **Step 4: Commit**

```bash
git add api/products.ts api/revalidate.ts
git commit -m "feat: add Vercel edge functions for cached product catalog"
```

---

## Task 4: Auth Gate + Login Page

**Files:**
- Modify: `src/pages/admin/AdminRoot.tsx` (replace stub)
- Create: `src/pages/admin/AdminLogin.tsx`

- [ ] **Step 1: Replace `src/pages/admin/AdminRoot.tsx`**

```typescript
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
```

- [ ] **Step 2: Create stub `src/pages/admin/AdminPanel.tsx`**

```typescript
// src/pages/admin/AdminPanel.tsx  (stub — replaced in Task 5)
import type { Session } from '@supabase/supabase-js'
interface Props { session: Session }
export function AdminPanel({ session }: Props) {
  return <div className="p-8">Panel — {session.user.email}</div>
}
```

- [ ] **Step 3: Create `src/pages/admin/AdminLogin.tsx`**

```typescript
// src/pages/admin/AdminLogin.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

export function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    }
    // On success AdminRoot's onAuthStateChange handles the redirect
  }

  return (
    <div
      className="min-h-screen bg-[#1A1613] flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(196,27,46,0.08) 0%, transparent 60%)' }}
    >
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src="/images/logo/Logo.png"
            alt="Empero"
            className="h-10 w-auto mx-auto brightness-0 invert mb-4"
          />
          <p className="text-[#6B6159] text-sm tracking-wide">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-semibold text-[#1A1613] mb-6">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#4A4540] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@empero.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-1 focus:ring-[#C41B2E] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#4A4540] mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-1 focus:ring-[#C41B2E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C0B5A8] hover:text-[#6B6159] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C41B2E] text-white rounded-lg text-sm font-semibold hover:bg-[#B51426] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>

          <p className="text-xs text-[#C0B5A8] text-center mt-6 leading-relaxed">
            La sesión se mantiene activa hasta que cierres sesión manualmente.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript + manual test**

```bash
npx tsc --noEmit
npm run dev
```

Navigate to `http://localhost:5173/admin`:
- Should show the dark login page with Empero logo
- Try wrong credentials → should show "Email o contraseña incorrectos"
- Try correct credentials → session is set, shows "Panel — email@..."

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminRoot.tsx src/pages/admin/AdminLogin.tsx src/pages/admin/AdminPanel.tsx
git commit -m "feat: admin auth gate with supabase login page"
```

---

## Task 5: Admin Panel Shell (Layout + Sidebar)

**Files:**
- Modify: `src/pages/admin/AdminPanel.tsx` (replace stub with full implementation)

- [ ] **Step 1: Replace `src/pages/admin/AdminPanel.tsx`**

```typescript
// src/pages/admin/AdminPanel.tsx
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Toaster } from 'sonner'
import {
  LayoutDashboard, Package, Menu, LogOut, ChevronRight, RefreshCw,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Dashboard } from './views/Dashboard'
import { Products } from './views/Products'

export type AdminView = 'dashboard' | 'products'

interface Props { session: Session }

export function AdminPanel({ session }: Props) {
  const [view, setView]           = useState<AdminView>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [purging, setPurging]     = useState(false)

  const handleLogout = () => supabase.auth.signOut()

  const handlePurgeCache = async () => {
    setPurging(true)
    try {
      const { toast } = await import('sonner')
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': import.meta.env.VITE_REVALIDATE_SECRET ?? '' },
      })
      if (res.ok) toast.success('Caché de productos reseteado')
      else        toast.error('No se pudo resetear el caché')
    } catch {
      const { toast } = await import('sonner')
      toast.error('Error al conectar con el servidor')
    } finally {
      setPurging(false)
    }
  }

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'products'  as AdminView, label: 'Productos',  icon: Package },
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

        {/* View content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'products'  && <Products />}
        </main>
      </div>
    </div>
  )
}
```

Note: `VITE_REVALIDATE_SECRET` needs to be added to `.env.local` (same value as `REVALIDATE_SECRET` — the `VITE_` prefix makes it available client-side). This is acceptable since the revalidate endpoint validates the secret server-side.

- [ ] **Step 2: Create view stubs to satisfy imports**

```typescript
// src/pages/admin/views/Dashboard.tsx  (stub)
import type { AdminView } from '../AdminPanel'
interface Props { onNavigate: (v: AdminView) => void }
export function Dashboard({ onNavigate }: Props) {
  return <div className="p-4">Dashboard stub <button onClick={() => onNavigate('products')}>→ Products</button></div>
}
```

```typescript
// src/pages/admin/views/Products.tsx  (stub)
export function Products() {
  return <div className="p-4">Products stub</div>
}
```

- [ ] **Step 3: Verify TypeScript + visual check**

```bash
npx tsc --noEmit
npm run dev
```

Login at `/admin`, verify:
- Dark sidebar on desktop, hamburger on mobile
- Nav items highlight on click
- "Cerrar sesión" button triggers sign-out (returns to login)
- Layout is responsive

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminPanel.tsx src/pages/admin/views/Dashboard.tsx src/pages/admin/views/Products.tsx
git commit -m "feat: admin panel layout with sidebar navigation"
```

---

## Task 6: Dashboard View

**Files:**
- Modify: `src/pages/admin/views/Dashboard.tsx` (replace stub)

- [ ] **Step 1: Replace `src/pages/admin/views/Dashboard.tsx`**

```typescript
// src/pages/admin/views/Dashboard.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Producto, LOW_STOCK_THRESHOLD } from '@/types/producto'
import type { AdminView } from '../AdminPanel'
import {
  Package, TrendingDown, AlertTriangle, ShoppingCart, XCircle, ArrowRight,
} from 'lucide-react'

interface Props { onNavigate: (v: AdminView) => void }

interface Stats {
  total: number
  enStock: number
  porEncargo: number
  stockBajo: number
  sinStock: number
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EBE5DC] flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1A1613] tabular-nums">{value}</p>
        <p className="text-sm text-[#6B6159] font-medium leading-tight mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[#9E9080] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function Dashboard({ onNavigate }: Props) {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [alerts, setAlerts]     = useState<Producto[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')

      if (error || !data) { setLoading(false); return }

      const productos = data as Producto[]
      const enStock = productos.filter(p => p.modo_disponibilidad === 'en_stock')

      setStats({
        total:       productos.length,
        enStock:     enStock.filter(p => p.stock > 0).length,
        porEncargo:  productos.filter(p => p.modo_disponibilidad === 'por_encargo').length,
        stockBajo:   enStock.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
        sinStock:    enStock.filter(p => p.stock === 0).length,
      })

      setAlerts(
        enStock
          .filter(p => p.stock <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 20),
      )

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-[#6B6159] text-sm">Error cargando estadísticas.</p>
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1613]">Dashboard</h1>
        <p className="text-sm text-[#9E9080] mt-1">Resumen del inventario en tiempo real</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total productos"  value={stats.total}      icon={Package}    color="bg-[#F4F0E8] text-[#6B6159]" />
        <StatCard label="En stock"         value={stats.enStock}    icon={ShoppingCart} color="bg-green-50 text-green-600" />
        <StatCard label="Por encargo"      value={stats.porEncargo} icon={TrendingDown}  color="bg-blue-50 text-blue-500" />
        <StatCard label="Sin stock"        value={stats.sinStock}   icon={XCircle}    color="bg-red-50 text-red-500"
          sub={stats.sinStock > 0 ? 'requieren atención' : undefined} />
      </div>

      {/* Low stock banner */}
      {stats.stockBajo > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            {stats.stockBajo} producto{stats.stockBajo !== 1 ? 's' : ''} con stock bajo (≤ {LOW_STOCK_THRESHOLD} unidades)
          </p>
        </div>
      )}

      {/* Alerts table */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE5DC] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE5DC]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-[#1A1613] text-sm">Productos con stock crítico</h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-[#C41B2E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#F4F0E8]">
            {alerts.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAF8F4] transition-colors">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden">
                  {p.cloudinary_url
                    ? <img src={p.cloudinary_url} alt={p.nombre} className="w-full h-full object-cover" />
                    : <Package className="w-5 h-5 text-[#C0B5A8] m-auto mt-2.5" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1613] truncate">{p.nombre}</p>
                  <p className="text-xs text-[#9E9080]">{p.codigo} · {p.categoria}</p>
                </div>

                {/* Stock badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  p.stock === 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} ud.`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && stats.sinStock === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-sm text-green-700 font-medium">
            Todo el inventario está en buen estado. No hay alertas de stock.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Login → Dashboard should show 4 stat cards and the alerts list loaded from Supabase.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/views/Dashboard.tsx
git commit -m "feat: admin dashboard with live stats and low-stock alerts"
```

---

## Task 7: Products Table View

**Files:**
- Modify: `src/pages/admin/views/Products.tsx` (replace stub)
- Create: `src/pages/admin/modals/ProductModal.tsx` (stub — full implementation in Task 8)

- [ ] **Step 1: Create stub modal**

```typescript
// src/pages/admin/modals/ProductModal.tsx  (stub)
import type { Producto } from '@/types/producto'
interface Props {
  producto: Producto | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}
export function ProductModal({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8">
        Modal stub <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/pages/admin/views/Products.tsx`**

```typescript
// src/pages/admin/views/Products.tsx
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS, LOW_STOCK_THRESHOLD } from '@/types/producto'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, Package, AlertTriangle,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import { ProductModal } from '../modals/ProductModal'

const PAGE_SIZE = 20

function StockBadge({ p }: { p: Producto }) {
  if (p.modo_disponibilidad === 'por_encargo') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
        Por encargo
      </span>
    )
  }
  if (p.stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
        Sin stock
      </span>
    )
  }
  if (p.stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="w-3 h-3" /> {p.stock} ud.
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
      {p.stock} ud.
    </span>
  )
}

export function Products() {
  const [productos, setProductos]   = useState<Producto[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [categoria, setCategoria]   = useState('')
  const [modo, setModo]             = useState<'all' | 'en_stock' | 'por_encargo'>('all')
  const [page, setPage]             = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<Producto | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .order('nombre')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (search.trim()) query = query.ilike('nombre', `%${search.trim()}%`)
    if (categoria)     query = query.eq('categoria', categoria)
    if (modo !== 'all') query = query.eq('modo_disponibilidad', modo)

    const { data, count, error } = await query

    if (error) { toast.error('Error al cargar productos'); setLoading(false); return }
    setProductos((data ?? []) as Producto[])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [page, search, categoria, modo])

  useEffect(() => { load() }, [load])
  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, categoria, modo])

  const handleDelete = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('productos').delete().eq('id', p.id)
    if (error) { toast.error('Error al eliminar producto'); return }
    toast.success('Producto eliminado')
    load()
  }

  const handleToggleDisponible = async (p: Producto) => {
    const { error } = await supabase
      .from('productos')
      .update({ disponible: !p.disponible })
      .eq('id', p.id)
    if (error) { toast.error('Error al actualizar disponibilidad'); return }
    toast.success(`Producto ${!p.disponible ? 'activado' : 'desactivado'}`)
    load()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1613]">Productos</h1>
          <p className="text-sm text-[#9E9080] mt-0.5">{totalCount} productos en total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C41B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#B51426] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#EBE5DC] p-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-4 py-2 border border-[#EBE5DC] rounded-lg text-sm focus:outline-none focus:border-[#C41B2E] transition-colors"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0B5A8]" />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="pl-8 pr-8 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] cursor-pointer appearance-none bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Mode */}
        <select
          value={modo}
          onChange={e => setModo(e.target.value as typeof modo)}
          className="px-3 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] cursor-pointer appearance-none bg-white"
        >
          <option value="all">Todos los modos</option>
          <option value="en_stock">En stock</option>
          <option value="por_encargo">Por encargo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE5DC] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#C41B2E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#9E9080]">
            <Package className="w-8 h-8" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE5DC] bg-[#FAF8F4]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide w-12" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#9E9080] uppercase tracking-wide hidden lg:table-cell">Visible</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0E8]">
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F4] transition-colors">
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F4F0E8] flex-shrink-0 overflow-hidden">
                        {p.cloudinary_url
                          ? <img src={p.cloudinary_url} alt={p.nombre} className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-[#C0B5A8] m-auto mt-2.5" />
                        }
                      </div>
                    </td>

                    {/* Codigo */}
                    <td className="px-4 py-3 font-mono text-xs text-[#6B6159]">{p.codigo}</td>

                    {/* Nombre */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-medium text-[#1A1613] truncate">{p.nombre}</p>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[#9E9080]">{p.categoria}</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge p={p} />
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-[#6B6159] tabular-nums">
                      {p.precio_usd != null ? `US$ ${Number(p.precio_usd).toLocaleString('es-AR')}` : '—'}
                    </td>

                    {/* Disponible toggle */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${p.disponible ? 'bg-green-500' : 'bg-[#D8D0C6]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${p.disponible ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true) }}
                          className="p-1.5 text-[#9E9080] hover:text-[#C41B2E] hover:bg-[#F4F0E8] rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-[#9E9080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EBE5DC]">
            <p className="text-xs text-[#9E9080]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs font-medium text-[#1A1613]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        producto={editing}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={() => { setModalOpen(false); setEditing(null); load() }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript + visual check**

```bash
npx tsc --noEmit
npm run dev
```

In admin panel → Productos view: table loads, search works, category/mode filters filter data, edit button opens stub modal.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/views/Products.tsx src/pages/admin/modals/ProductModal.tsx
git commit -m "feat: admin products table with search, filters, and pagination"
```

---

## Task 8: Product Form Modal (Full Implementation)

**Files:**
- Modify: `src/pages/admin/modals/ProductModal.tsx` (replace stub with full form)

This is the most complex file. The form maps between a flat form state and the Supabase JSONB schema.

JSONB field mapping:
- `dimensiones_mm` → three inputs: `dim_ancho`, `dim_prof`, `dim_alto`
- `temperaturas_c` → two inputs: `temp_lavado`, `temp_enjuague`
- `potencias_kw` → two inputs: `pot_total`, `pot_motor`
- `programas` → one input: `prog_cantidad`
- `accesorios_incluidos` → textarea, one item per line
- `caracteristicas_generales` → textarea, one item per line

- [ ] **Step 1: Replace `src/pages/admin/modals/ProductModal.tsx`**

```typescript
// src/pages/admin/modals/ProductModal.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { type Producto, CATEGORIAS } from '@/types/producto'
import { toast } from 'sonner'
import { X, Save, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Zod schema ────────────────────────────────────────────────────────────

const schema = z.object({
  nombre:               z.string().min(1, 'Requerido'),
  codigo:               z.string().min(1, 'Requerido'),
  categoria:            z.string().min(1, 'Requerido'),
  precio_usd:           z.coerce.number().nullable().optional(),
  stock:                z.coerce.number().int().min(0).default(0),
  disponible:           z.boolean().default(true),
  modo_disponibilidad:  z.enum(['en_stock', 'por_encargo']),
  cloudinary_url:       z.string().nullable().optional(),
  cloudinary_image_id:  z.string().nullable().optional(),
  voltaje:              z.string().nullable().optional(),
  peso_kg:              z.coerce.number().nullable().optional(),
  volumen_m3:           z.coerce.number().nullable().optional(),
  capacidad:            z.string().nullable().optional(),
  motor_rpm:            z.coerce.number().int().nullable().optional(),
  dimensiones_canasto_mm: z.string().nullable().optional(),
  dim_ancho:            z.coerce.number().nullable().optional(),
  dim_prof:             z.coerce.number().nullable().optional(),
  dim_alto:             z.coerce.number().nullable().optional(),
  temp_lavado:          z.coerce.number().nullable().optional(),
  temp_enjuague:        z.coerce.number().nullable().optional(),
  pot_total:            z.coerce.number().nullable().optional(),
  pot_motor:            z.coerce.number().nullable().optional(),
  prog_cantidad:        z.coerce.number().int().nullable().optional(),
  accesorios:           z.string().default(''),
  caracteristicas:      z.string().default(''),
})

type FormValues = z.infer<typeof schema>

// ─── Helpers ───────────────────────────────────────────────────────────────

function toForm(p: Producto): FormValues {
  return {
    nombre:               p.nombre,
    codigo:               p.codigo,
    categoria:            p.categoria,
    precio_usd:           p.precio_usd ?? undefined,
    stock:                p.stock,
    disponible:           p.disponible,
    modo_disponibilidad:  p.modo_disponibilidad,
    cloudinary_url:       p.cloudinary_url ?? '',
    cloudinary_image_id:  p.cloudinary_image_id ?? '',
    voltaje:              p.voltaje ?? '',
    peso_kg:              p.peso_kg ?? undefined,
    volumen_m3:           p.volumen_m3 ?? undefined,
    capacidad:            p.capacidad ?? '',
    motor_rpm:            p.motor_rpm ?? undefined,
    dimensiones_canasto_mm: p.dimensiones_canasto_mm ?? '',
    dim_ancho:            p.dimensiones_mm?.Ancho ?? undefined,
    dim_prof:             p.dimensiones_mm?.Profundidad ?? undefined,
    dim_alto:             p.dimensiones_mm?.Alto ?? undefined,
    temp_lavado:          p.temperaturas_c?.Lavado ?? undefined,
    temp_enjuague:        p.temperaturas_c?.Enjuague ?? undefined,
    pot_total:            p.potencias_kw?.Total ?? undefined,
    pot_motor:            p.potencias_kw?.Motor ?? undefined,
    prog_cantidad:        p.programas?.Cantidad ?? undefined,
    accesorios:           (p.accesorios_incluidos ?? []).join('\n'),
    caracteristicas:      (p.caracteristicas_generales ?? []).join('\n'),
  }
}

function fromForm(v: FormValues, id?: string): Record<string, unknown> {
  const nullIfEmpty = (s?: string | null) => (s && s.trim() ? s.trim() : null)

  return {
    ...(id ? { id } : {}),
    nombre:               v.nombre,
    codigo:               v.codigo,
    categoria:            v.categoria,
    precio_usd:           v.precio_usd ?? null,
    stock:                v.stock,
    disponible:           v.disponible,
    modo_disponibilidad:  v.modo_disponibilidad,
    cloudinary_url:       nullIfEmpty(v.cloudinary_url),
    cloudinary_image_id:  nullIfEmpty(v.cloudinary_image_id),
    voltaje:              nullIfEmpty(v.voltaje),
    peso_kg:              v.peso_kg ?? null,
    volumen_m3:           v.volumen_m3 ?? null,
    capacidad:            nullIfEmpty(v.capacidad),
    motor_rpm:            v.motor_rpm ?? null,
    dimensiones_canasto_mm: nullIfEmpty(v.dimensiones_canasto_mm),
    dimensiones_mm:
      v.dim_ancho || v.dim_prof || v.dim_alto
        ? { Ancho: v.dim_ancho ?? undefined, Profundidad: v.dim_prof ?? undefined, Alto: v.dim_alto ?? undefined }
        : null,
    temperaturas_c:
      v.temp_lavado || v.temp_enjuague
        ? { Lavado: v.temp_lavado ?? undefined, Enjuague: v.temp_enjuague ?? undefined }
        : null,
    potencias_kw:
      v.pot_total
        ? { Total: v.pot_total, ...(v.pot_motor ? { Motor: v.pot_motor } : {}) }
        : null,
    programas:
      v.prog_cantidad ? { Cantidad: v.prog_cantidad } : null,
    accesorios_incluidos:
      v.accesorios.trim() ? v.accesorios.split('\n').map(s => s.trim()).filter(Boolean) : null,
    caracteristicas_generales:
      v.caracteristicas.trim() ? v.caracteristicas.split('\n').map(s => s.trim()).filter(Boolean) : null,
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Field({
  label, error, children, hint,
}: {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#4A4540]">{label}</label>
      {children}
      {hint  && !error && <p className="text-xs text-[#9E9080]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-1 focus:ring-[rgba(196,27,46,0.2)] transition-colors placeholder:text-[#C0B5A8]'

// ─── Main component ─────────────────────────────────────────────────────────

interface Props {
  producto: Producto | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ProductModal({ producto, open, onClose, onSaved }: Props) {
  const isEdit = producto != null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      stock: 0,
      disponible: true,
      modo_disponibilidad: 'en_stock',
      accesorios: '',
      caracteristicas: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(producto ? toForm(producto) : {
        stock: 0,
        disponible: true,
        modo_disponibilidad: 'en_stock',
        accesorios: '',
        caracteristicas: '',
      })
    }
  }, [open, producto, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = fromForm(values, isEdit ? producto!.id : undefined)

    let error: unknown
    if (isEdit) {
      const { error: e } = await supabase.from('productos').update(payload).eq('id', producto!.id)
      error = e
    } else {
      const { error: e } = await supabase.from('productos').insert(payload)
      error = e
    }

    if (error) {
      toast.error(`Error al ${isEdit ? 'guardar' : 'crear'} el producto`)
      console.error(error)
      return
    }

    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
    onSaved()
  }

  if (!open) return null

  const disponible = watch('disponible')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBE5DC]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1613]">
              {isEdit ? 'Editar producto' : 'Agregar producto'}
            </h2>
            {isEdit && <p className="text-xs text-[#9E9080] mt-0.5">{producto!.codigo}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9E9080] hover:bg-[#F4F0E8] hover:text-[#1A1613] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="mx-6 mt-4 grid grid-cols-4 h-9 bg-[#F4F0E8] rounded-xl p-1">
              <TabsTrigger value="basico"   className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Básico</TabsTrigger>
              <TabsTrigger value="imagen"   className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Imagen</TabsTrigger>
              <TabsTrigger value="fisico"   className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Físico</TabsTrigger>
              <TabsTrigger value="tecnico"  className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#1A1613] data-[state=active]:shadow-sm">Técnico</TabsTrigger>
            </TabsList>

            {/* TAB: Básico */}
            <TabsContent value="basico" className="px-6 pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre *" error={errors.nombre?.message}>
                  <input {...register('nombre')} className={inputCls} placeholder="Ej: Lavavajillas Industrial LV-500" />
                </Field>
                <Field label="Código *" error={errors.codigo?.message}>
                  <input {...register('codigo')} className={inputCls} placeholder="Ej: EMP.LV-500" />
                </Field>
              </div>

              <Field label="Categoría *" error={errors.categoria?.message}>
                <select {...register('categoria')} className={inputCls + ' cursor-pointer'}>
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio (USD)" error={errors.precio_usd?.message}>
                  <input type="number" step="0.01" min="0" {...register('precio_usd')} className={inputCls} placeholder="0.00" />
                </Field>
                <Field label="Stock actual" error={errors.stock?.message}>
                  <input type="number" min="0" {...register('stock')} className={inputCls} placeholder="0" />
                </Field>
              </div>

              <Field label="Modo de disponibilidad *">
                <div className="grid grid-cols-2 gap-2">
                  {(['en_stock', 'por_encargo'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-3 px-3 py-2.5 border border-[#EBE5DC] rounded-lg cursor-pointer hover:border-[#C41B2E] has-[:checked]:border-[#C41B2E] has-[:checked]:bg-[rgba(196,27,46,0.03)] transition-colors">
                      <input type="radio" value={opt} {...register('modo_disponibilidad')} className="accent-[#C41B2E]" />
                      <span className="text-sm text-[#1A1613] font-medium">
                        {opt === 'en_stock' ? 'En stock' : 'Por encargo'}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('disponible')} className="w-4 h-4 accent-[#C41B2E] rounded" />
                <div>
                  <span className="text-sm font-medium text-[#1A1613]">Visible en el catálogo</span>
                  <p className="text-xs text-[#9E9080]">
                    {disponible ? 'El producto aparece en la tienda' : 'El producto está oculto'}
                  </p>
                </div>
              </label>
            </TabsContent>

            {/* TAB: Imagen */}
            <TabsContent value="imagen" className="px-6 pt-5 pb-4 space-y-4">
              <Field label="URL de imagen (Cloudinary)" hint="La URL completa de la imagen optimizada de Cloudinary">
                <input {...register('cloudinary_url')} className={inputCls} placeholder="https://res.cloudinary.com/..." />
              </Field>
              <Field label="ID público Cloudinary" hint="El public_id del recurso en Cloudinary">
                <input {...register('cloudinary_image_id')} className={inputCls} placeholder="empero/productos/lv-500" />
              </Field>

              {watch('cloudinary_url') && (
                <div className="mt-2">
                  <p className="text-xs text-[#9E9080] mb-2">Vista previa:</p>
                  <img
                    src={watch('cloudinary_url') ?? ''}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-[#EBE5DC]"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </TabsContent>

            {/* TAB: Físico */}
            <TabsContent value="fisico" className="px-6 pt-5 pb-4 space-y-4">
              <p className="text-xs text-[#9E9080] -mt-1">Todos los campos son opcionales.</p>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Dimensiones externas</legend>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Ancho (mm)">
                    <input type="number" {...register('dim_ancho')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Profundidad (mm)">
                    <input type="number" {...register('dim_prof')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Alto (mm)">
                    <input type="number" {...register('dim_alto')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Peso (kg)">
                  <input type="number" step="0.01" {...register('peso_kg')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Volumen (m³)">
                  <input type="number" step="0.0001" {...register('volumen_m3')} className={inputCls} placeholder="—" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacidad" hint='Ej: "50 L" o "20 bandejas"'>
                  <input {...register('capacidad')} className={inputCls} placeholder="—" />
                </Field>
                <Field label="Dim. canasto (mm)">
                  <input {...register('dimensiones_canasto_mm')} className={inputCls} placeholder="Ej: 500×500" />
                </Field>
              </div>
            </TabsContent>

            {/* TAB: Técnico */}
            <TabsContent value="tecnico" className="px-6 pt-5 pb-4 space-y-4">
              <p className="text-xs text-[#9E9080] -mt-1">Todos los campos son opcionales.</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Voltaje">
                  <input {...register('voltaje')} className={inputCls} placeholder="Ej: 220V / 380V" />
                </Field>
                <Field label="Motor (RPM)">
                  <input type="number" {...register('motor_rpm')} className={inputCls} placeholder="—" />
                </Field>
              </div>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Potencias (kW)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total">
                    <input type="number" step="0.01" {...register('pot_total')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Motor">
                    <input type="number" step="0.01" {...register('pot_motor')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="border border-[#EBE5DC] rounded-xl p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-[#6B6159] uppercase tracking-wide">Temperaturas (°C)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lavado">
                    <input type="number" {...register('temp_lavado')} className={inputCls} placeholder="—" />
                  </Field>
                  <Field label="Enjuague">
                    <input type="number" {...register('temp_enjuague')} className={inputCls} placeholder="—" />
                  </Field>
                </div>
              </fieldset>

              <Field label="Cantidad de programas">
                <input type="number" {...register('prog_cantidad')} className={inputCls} placeholder="—" />
              </Field>

              <Field label="Accesorios incluidos" hint="Un accesorio por línea">
                <textarea
                  {...register('accesorios')}
                  rows={4}
                  className={inputCls + ' resize-none'}
                  placeholder={"Cesta porta-vajilla\nBandeja de escurrido\nManual de usuario"}
                />
              </Field>

              <Field label="Características generales" hint="Una característica por línea">
                <textarea
                  {...register('caracteristicas')}
                  rows={4}
                  className={inputCls + ' resize-none'}
                  placeholder={"Construcción en acero inoxidable\nDoble pared aislada\nPanel de control digital"}
                />
              </Field>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EBE5DC] bg-[#FAF8F4] rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B6159] hover:text-[#1A1613] hover:bg-[#EBE5DC] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-[#C41B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#B51426] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />{isEdit ? 'Guardar cambios' : 'Crear producto'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `VITE_REVALIDATE_SECRET` to `.env.local`**

```bash
# Add to .env.local:
VITE_REVALIDATE_SECRET=<same value as REVALIDATE_SECRET>
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 4: Full manual test**

```bash
npm run dev
```

1. Navigate to `/admin`, log in.
2. Products table loads with data from Supabase.
3. Click "Agregar producto" → modal opens with 4 tabs, all fields present.
4. Fill in Nombre, Código, Categoría, select stock mode → click "Crear producto".
5. Success toast appears, modal closes, table reloads with new product.
6. Click edit (pencil icon) on any product → modal opens pre-filled with existing data.
7. Modify a field → save → toast + table updates.
8. Toggle the visible switch → updates without modal.
9. Delete a product → confirm dialog → product disappears.
10. Dashboard tab → stats reflect current Supabase data, alerts show low-stock products.
11. Sidebar "Resetear caché" → toast confirms (requires deployed Vercel env vars).
12. Resize browser to mobile → hamburger opens Sheet sidebar.

- [ ] **Step 5: Final commit**

```bash
git add src/pages/admin/modals/ProductModal.tsx .env.local
git commit -m "feat: product form modal with full schema support and tabs"
```

---

## Post-Deploy Checklist

After deploying to Vercel:

- [ ] Add all required env vars in Vercel dashboard (Settings → Environment Variables):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `REVALIDATE_SECRET`
  - `VITE_REVALIDATE_SECRET` (same value, different prefix for client)
  - `VERCEL_TOKEN` (optional, for actual CDN purge)

- [ ] Test `https://yourdomain.com/api/products` returns JSON with `Cache-Control` header.

- [ ] Test `POST https://yourdomain.com/api/revalidate` with `x-revalidate-secret` header returns `{ revalidated: true }`.

- [ ] Test `/admin` login flow on mobile.

- [ ] In Supabase dashboard: confirm RLS policy on `productos` allows `authenticated` role for all operations.

- [ ] Disable email signups in Supabase (Auth → Providers → Email → uncheck "Enable email signup").
