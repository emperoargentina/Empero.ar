// src/components/admin/FamilyPicker.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Layers } from 'lucide-react'
import type { FamilyOption } from '@/lib/adminFamilies'

interface FamilyPickerProps {
  value: string | null
  options: FamilyOption[]
  onChange: (familiaId: string | null) => void
}

const inputCls =
  'w-full pl-9 pr-3 py-2.5 border border-[#EBE5DC] rounded-lg text-sm text-[#1A1613] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[rgba(196,27,46,0.1)] transition-all placeholder:text-[#C0B5A8] bg-white'

export function FamilyPicker({ value, options, onChange }: FamilyPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => options.find(o => o.familia_id === value) ?? null, [options, value])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q ? options.filter(o => o.nombre.toLowerCase().includes(q)) : options
    return pool.slice(0, 8)
  }, [query, options])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-[#EBE5DC] bg-[#FAF8F4]">
        <span className="flex items-center gap-2 text-sm text-[#1A1613] min-w-0">
          <Layers className="w-4 h-4 text-[#C41B2E] flex-shrink-0" />
          <span className="truncate font-medium">{selected.nombre}</span>
          <span className="text-xs text-[#9E9080] flex-shrink-0">
            · {selected.count} variante{selected.count !== 1 ? 's' : ''}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[#C0B5A8] hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0B5A8]" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className={inputCls}
          placeholder="Buscar familia existente..."
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-[#EBE5DC] bg-white shadow-lg">
          {matches.map(o => (
            <button
              key={o.familia_id}
              type="button"
              onClick={() => { onChange(o.familia_id); setQuery(''); setOpen(false) }}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#FAF8F4] transition-colors cursor-pointer"
            >
              <span className="truncate text-[#1A1613]">{o.nombre}</span>
              <span className="text-xs text-[#9E9080] flex-shrink-0">
                {o.count} variante{o.count !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && matches.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#EBE5DC] bg-white shadow-lg px-4 py-3 text-xs text-[#9E9080]">
          No hay familias existentes con ese nombre. Para crear una, usá "Agregar variante" desde un producto ya guardado.
        </div>
      )}
    </div>
  )
}
