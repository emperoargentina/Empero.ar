import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Inbox, Search, Loader2, Mail, Phone, Building2, Trash2, Archive,
  CheckCheck, RotateCcw, ChevronDown, RefreshCw, MailWarning,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeText, searchTokens, matchesAllTokens } from '@/lib/text'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import type { Consulta, EstadoConsulta } from '@/types/consulta'

type Filtro = 'todas' | EstadoConsulta

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'leida', label: 'Leídas' },
  { value: 'respondida', label: 'Respondidas' },
  { value: 'archivada', label: 'Archivadas' },
]

const ESTADO_STYLE: Record<EstadoConsulta, { label: string; cls: string }> = {
  nueva:      { label: 'Nueva',      cls: 'bg-[#FDF2F2] text-[#C3151B] border-[#F7C7C8]' },
  leida:      { label: 'Leída',      cls: 'bg-[#F4F0E8] text-[#6B6159] border-[#EBE5DC]' },
  respondida: { label: 'Respondida', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archivada:  { label: 'Archivada',  cls: 'bg-white text-[#9E9080] border-[#EBE5DC]' },
}

const dateFmt = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
const relFmt = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })

function relativeTime(iso: string): string {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  if (Math.abs(diffMin) < 60) return relFmt.format(diffMin, 'minute')
  const diffH = Math.round(diffMin / 60)
  if (Math.abs(diffH) < 24) return relFmt.format(diffH, 'hour')
  return relFmt.format(Math.round(diffH / 24), 'day')
}

// Teléfonos argentinos cargados a mano ("11 3228-6523", "+54 9 11…") → formato wa.me.
function whatsappNumber(telefono: string): string | null {
  const digits = telefono.replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits.startsWith('54') ? digits : `549${digits.replace(/^0/, '')}`
}

function fetchConsultas() {
  return supabase
    .from('consultas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
}

export function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<Consulta | null>(null)

  const load = useCallback(() => {
    let cancelled = false
    fetchConsultas().then(({ data, error }) => {
      if (cancelled) return
      if (error) toast.error('Error al cargar consultas: ' + error.message)
      setConsultas((data as Consulta[] | null) ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => load(), [load])

  const counts = useMemo(() => {
    const c: Record<Filtro, number> = { todas: consultas.length, nueva: 0, leida: 0, respondida: 0, archivada: 0 }
    for (const q of consultas) c[q.estado]++
    return c
  }, [consultas])

  const visibles = useMemo(() => {
    const tokens = searchTokens(search)
    return consultas.filter(q => {
      if (filtro !== 'todas' && q.estado !== filtro) return false
      if (!tokens.length) return true
      const haystack = normalizeText([q.nombre, q.email, q.empresa, q.telefono, q.mensaje].join(' '))
      return matchesAllTokens(haystack, tokens)
    })
  }, [consultas, filtro, search])

  const setEstado = useCallback(async (consulta: Consulta, estado: EstadoConsulta, silent = false) => {
    if (consulta.estado === estado) return
    const previo = consulta.estado
    setConsultas(prev => prev.map(q => (q.id === consulta.id ? { ...q, estado } : q)))
    const { error } = await supabase.from('consultas').update({ estado }).eq('id', consulta.id)
    if (error) {
      setConsultas(prev => prev.map(q => (q.id === consulta.id ? { ...q, estado: previo } : q)))
      toast.error('No se pudo actualizar: ' + error.message)
      return
    }
    if (!silent) toast.success(`Marcada como ${ESTADO_STYLE[estado].label.toLowerCase()}`)
  }, [])

  const toggleOpen = (consulta: Consulta) => {
    const opening = openId !== consulta.id
    setOpenId(opening ? consulta.id : null)
    if (opening && consulta.estado === 'nueva') setEstado(consulta, 'leida', true)
  }

  const confirmDelete = async () => {
    const target = deleteCandidate
    setDeleteCandidate(null)
    if (!target) return
    const { error } = await supabase.from('consultas').delete().eq('id', target.id)
    if (error) {
      toast.error('No se pudo eliminar: ' + error.message)
      return
    }
    setConsultas(prev => prev.filter(q => q.id !== target.id))
    toast.success('Consulta eliminada')
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1613] tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-[#C3151B]" />
            Consultas
          </h1>
          <p className="text-sm text-[#9E9080] mt-1">
            Mensajes del formulario de contacto del sitio.
            {counts.nueva > 0 && (
              <strong className="text-[#C3151B] ml-1">
                {counts.nueva} {counts.nueva === 1 ? 'nueva' : 'nuevas'}.
              </strong>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setLoading(true); load() }}
          disabled={loading}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#EBE5DC] bg-white text-sm font-medium text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <search className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9080] pointer-events-none" aria-hidden="true" />
          <label htmlFor="consultas-search" className="sr-only">Buscar consultas</label>
          <input
            id="consultas-search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, empresa o texto…"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#EBE5DC] bg-white text-base sm:text-sm text-[#1A1613] placeholder:text-[#9E9080]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="group" aria-label="Filtrar por estado">
          {FILTROS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltro(f.value)}
              aria-pressed={filtro === f.value}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-colors ${
                filtro === f.value
                  ? 'bg-[#C3151B] border-[#C3151B] text-white'
                  : 'bg-white border-[#EBE5DC] text-[#6B6159] hover:bg-[#F4F0E8]'
              }`}
            >
              {f.label}
              <span className={`text-[11px] tabular-nums ${filtro === f.value ? 'text-white/80' : 'text-[#9E9080]'}`}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
      </search>

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="w-6 h-6 animate-spin text-[#C3151B]" />
        </div>
      ) : visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-[#D8D0C6] bg-white/60">
          <Inbox className="w-8 h-8 text-[#C0B5A8] mb-3" />
          <p className="text-sm font-semibold text-[#1A1613]">
            {consultas.length === 0 ? 'Todavía no llegaron consultas' : 'Sin resultados'}
          </p>
          <p className="text-xs text-[#9E9080] mt-1">
            {consultas.length === 0
              ? 'Cuando alguien complete el formulario de contacto, aparece acá.'
              : 'Probá con otro filtro o búsqueda.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibles.map(q => {
            const open = openId === q.id
            const estado = ESTADO_STYLE[q.estado]
            const wa = q.telefono ? whatsappNumber(q.telefono) : null
            const panelId = `consulta-${q.id}`
            return (
              <li
                key={q.id}
                className={`rounded-2xl border bg-white shadow-sm transition-shadow ${
                  open ? 'border-[#C3151B]/30 shadow-md' : 'border-[#EBE5DC] hover:shadow-md'
                }`}
              >
                <h2 className="m-0 font-sans">
                  <button
                    type="button"
                    onClick={() => toggleOpen(q)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="w-full text-left flex items-start gap-3 px-4 sm:px-5 py-4 cursor-pointer rounded-2xl"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${q.estado === 'nueva' ? 'bg-[#C3151B]' : 'bg-transparent'}`}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`text-[15px] text-[#1A1613] ${q.estado === 'nueva' ? 'font-bold' : 'font-semibold'}`}>
                          {q.nombre}
                        </span>
                        {q.empresa && <span className="text-[13px] text-[#9E9080]">· {q.empresa}</span>}
                        <span className={`text-[10.5px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md border ${estado.cls}`}>
                          {estado.label}
                        </span>
                      </span>
                      <span className="block text-[13px] text-[#6B6159] mt-1 line-clamp-2 text-pretty">{q.mensaje}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1 flex-shrink-0">
                      <time dateTime={q.created_at} title={dateFmt.format(new Date(q.created_at))} className="text-[12px] text-[#9E9080] whitespace-nowrap">
                        {relativeTime(q.created_at)}
                      </time>
                      <ChevronDown className={`w-4 h-4 text-[#9E9080] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </span>
                  </button>
                </h2>

                {open && (
                  <div id={panelId} className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#F0EAE2]">
                    <dl className="grid sm:grid-cols-3 gap-3 py-4 text-[13px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <dt><Mail className="w-4 h-4 text-[#C3151B]" aria-label="Email" /></dt>
                        <dd className="min-w-0 truncate">
                          <a href={`mailto:${q.email}`} className="font-medium text-[#1A1613] hover:text-[#C3151B] underline-offset-2 hover:underline">{q.email}</a>
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <dt><Phone className="w-4 h-4 text-[#C3151B]" aria-label="Teléfono" /></dt>
                        <dd className="min-w-0 truncate">
                          {q.telefono
                            ? <a href={`tel:${q.telefono.replace(/[^\d+]/g, '')}`} className="font-medium text-[#1A1613] hover:text-[#C3151B] underline-offset-2 hover:underline">{q.telefono}</a>
                            : <span className="text-[#9E9080]">Sin teléfono</span>}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <dt><Building2 className="w-4 h-4 text-[#C3151B]" aria-label="Empresa" /></dt>
                        <dd className="min-w-0 truncate text-[#1A1613] font-medium">{q.empresa || <span className="text-[#9E9080] font-normal">Sin empresa</span>}</dd>
                      </div>
                    </dl>

                    <p className="text-[14px] leading-relaxed text-[#3A3530] whitespace-pre-wrap text-pretty rounded-xl bg-[#FAF8F4] border border-[#F0EAE2] p-4">
                      {q.mensaje}
                    </p>

                    <p className="mt-2.5 text-[11.5px] text-[#9E9080] flex items-center gap-1.5">
                      {dateFmt.format(new Date(q.created_at))}
                      {!q.email_enviado && (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          · <MailWarning className="w-3.5 h-3.5" aria-hidden="true" /> El aviso por email no se envió
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <a
                        href={`mailto:${q.email}?subject=${encodeURIComponent('Re: Tu consulta a Empero Argentina')}`}
                        onClick={() => setEstado(q, 'respondida', true)}
                        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[#C3151B] text-white text-[13px] font-semibold hover:bg-[#A51116]"
                      >
                        <Mail className="w-4 h-4" aria-hidden="true" /> Responder por email
                      </a>
                      {wa && (
                        <a
                          href={getWhatsAppURL(`Hola ${q.nombre}, te escribimos de Empero Argentina por tu consulta.`, wa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setEstado(q, 'respondida', true)}
                          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1EAF56]"
                        >
                          <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                        </a>
                      )}
                      {q.estado !== 'respondida' && (
                        <button type="button" onClick={() => setEstado(q, 'respondida')} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#EBE5DC] bg-white text-[13px] font-medium text-[#6B6159] hover:bg-[#F4F0E8] cursor-pointer">
                          <CheckCheck className="w-4 h-4" aria-hidden="true" /> Marcar respondida
                        </button>
                      )}
                      {q.estado !== 'archivada' ? (
                        <button type="button" onClick={() => setEstado(q, 'archivada')} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#EBE5DC] bg-white text-[13px] font-medium text-[#6B6159] hover:bg-[#F4F0E8] cursor-pointer">
                          <Archive className="w-4 h-4" aria-hidden="true" /> Archivar
                        </button>
                      ) : (
                        <button type="button" onClick={() => setEstado(q, 'leida')} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#EBE5DC] bg-white text-[13px] font-medium text-[#6B6159] hover:bg-[#F4F0E8] cursor-pointer">
                          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Desarchivar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(q)}
                        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium text-[#9E9080] hover:text-[#C3151B] hover:bg-[#FDF2F2] cursor-pointer sm:ml-auto"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        isOpen={deleteCandidate !== null}
        title={`¿Eliminar la consulta de ${deleteCandidate?.nombre ?? ''}?`}
        description="Se borra del panel de forma permanente. Si solo querés sacarla de la vista, archivala."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  )
}
