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
