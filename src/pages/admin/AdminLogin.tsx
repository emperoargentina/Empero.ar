import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F0E8] via-[#FAF8F5] to-[#EDE8E0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Diagonal pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(26,22,19,0.02) 40px, rgba(26,22,19,0.02) 41px)',
            'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(26,22,19,0.02) 40px, rgba(26,22,19,0.02) 41px)',
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
          background: 'radial-gradient(circle, rgba(196,27,46,0.06) 0%, transparent 60%)',
          filter: 'blur(120px)',
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
                <Label className="block text-xs font-semibold text-[#4A4540] mb-1.5 uppercase tracking-wider">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] pointer-events-none z-10" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@empero.com"
                    className="pl-10 h-12 rounded-xl border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E]"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-xs font-semibold text-[#4A4540] mb-1.5 uppercase tracking-wider">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8] pointer-events-none z-10" />
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 rounded-xl border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] focus-visible:ring-2 focus-visible:ring-[#C41B2E]/10 focus-visible:border-[#C41B2E]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-[#C0B5A8] hover:text-[#6B6159] hover:bg-transparent"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
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

              <Button
                type="submit"
                variant="brand"
                disabled={loading}
                className="w-full h-12 rounded-xl active:scale-[0.985]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </Button>
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
