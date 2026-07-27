import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Package } from 'lucide-react'

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
  }

  return (
    <div className="min-h-screen bg-[#1A1613] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Diagonal pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)',
            'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)',
          ].join(', '),
        }}
      />

      {/* Radial gradient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,27,46,0.08) 0%, transparent 60%)',
          filter: 'blur(120px)',
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      <div className="w-full max-w-[420px] relative">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="h-1 bg-gradient-to-r from-transparent via-[#C41B2E] to-transparent" />

          <div className="px-10 pt-10 pb-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C41B2E] to-[#B51426] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#C41B2E]/25">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1613] tracking-tight">Empero</h1>
              <p className="text-sm text-[#9E9080] font-medium mt-0.5">Panel de administración</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#EBE5DC] to-transparent mb-6" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#4A4540] mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@empero.com"
                    className="w-full pl-10 pr-4 py-3 border border-[#EBE5DC] rounded-xl text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4540] mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-[#EBE5DC] rounded-xl text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all duration-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C0B5A8] hover:text-[#6B6159] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
                  style={{
                    color: '#EF4444',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#C41B2E] to-[#B51426] text-white rounded-xl text-sm font-semibold hover:from-[#B51426] hover:to-[#A0101F] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.985] shadow-lg shadow-[#C41B2E]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>

            <p className="text-xs text-[#C0B5A8]/60 text-center mt-6 leading-relaxed">
              La sesión se mantiene activa hasta que cierres sesión manualmente.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
