import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
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
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,27,46,0.06) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Card */}
      <div className="w-full max-w-[440px] relative">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Red accent line */}
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #C41B2E, transparent)' }}
          />

          <div className="px-12 pt-12 pb-10">
            {/* Logo + title */}
            <div className="text-center mb-8">
              <img
                src="/images/logo/Logo.png"
                alt="Empero"
                className="h-20 w-auto mx-auto mb-4"
              />
              <p className="text-[#9A8E82] text-lg font-bold tracking-wide">
                Panel de administración
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F0EAE2] mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#4A4540] mb-1.5">
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
                    className="w-full pl-10 pr-4 py-3 border border-[#EBE5DC] rounded-xl text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#4A4540] mb-1.5">
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
                    className="w-full pl-10 pr-10 py-3 border border-[#EBE5DC] rounded-xl text-sm text-[#1A1613] placeholder:text-[#C0B5A8] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all duration-200"
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

              {/* Error */}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#C41B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#B51426] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.985]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>

            <p className="text-xs text-[#C0B5A8]/60 text-center mt-7 leading-relaxed">
              La sesión se mantiene activa hasta que cierres sesión manualmente.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
