'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Package, Ruler, Weight, Zap, Flame, ArrowLeft, ArrowRight, Plus, Check } from 'lucide-react'
import { productCardImage } from '@/lib/cloudinaryUrl'
import { whatsappConfig } from '@/data/company'
import type { Product } from '@/data/products'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Props {
  products: Product[]
  onViewDetails: (product: Product) => void
  onAddToQuote?: (product: Product) => void
  onRemoveFromQuote?: (productId: string) => void
  quoteListIds?: string[]
}

const WhatsAppSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? 'w-4 h-4 flex-shrink-0'} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

function SpecPill({ icon: Icon, value }: { icon: React.ComponentType<{ className?: string }>; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1613]/[0.04] border border-[#1A1613]/[0.06] text-xs text-[#4A4540]">
      <Icon className="w-3 h-3 text-[#C41B2E]/60" />
      <span className="font-medium">{value}</span>
    </div>
  )
}

function formatDim(dims: Product['dimensiones_mm']): string | null {
  if (!dims) return null
  if (dims.Ancho) return `${dims.Ancho}×${dims.Profundidad || '?'}×${dims.Alto || dims.Alto_max || '?'} mm`
  return null
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 360 : -360, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -240 : 240, opacity: 0 }),
}

export function FeaturedCarousel({ products, onViewDetails, onAddToQuote, onRemoveFromQuote, quoteListIds = [] }: Props) {
  const [[page, dir], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const len = products.length

  const paginate = useCallback((newDir: number) => {
    setPage(([p, _]) => {
      const next = (p + newDir + len) % len
      return [next, newDir]
    })
  }, [len])

  const next = useCallback(() => paginate(1), [paginate])
  const prev = useCallback(() => paginate(-1), [paginate])
  const goTo = useCallback((i: number) => {
    setPage(([p, _]) => [i, i > p ? 1 : -1])
  }, [])

  useEffect(() => {
    if (len <= 1 || paused) return
    timerRef.current = setInterval(next, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [len, paused, next])

  if (!len) return null

  const product = products[page]
  const isInQuoteList = quoteListIds.includes(product.id)

  const specs = [
    { icon: Ruler, value: formatDim(product.dimensiones_mm) },
    { icon: Weight, value: product.capacidad },
    { icon: Zap, value: product.potencia_kw != null ? `${product.potencia_kw} kW` : null },
    { icon: Flame, value: product.consumo_gas_m3h != null ? `${product.consumo_gas_m3h} m³/h` : null },
  ].filter(s => s.value != null)

  const features = (product.caracteristicas_generales || []).slice(0, 4)

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.nombre, product.codigo))
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank')
  }

  const handleQuoteToggle = () => {
    if (!isInQuoteList) {
      onAddToQuote?.(product)
    } else {
      setConfirmRemoveOpen(true)
    }
  }

  return (
    <section className="py-16 lg:py-20 bg-[#FAFAF8] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#C41B2E]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <AnimatedSection direction="up">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Lo más destacado
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-[560] text-[#1A1613] flex items-center justify-center gap-3">
              <Star className="w-7 h-7 text-[#C41B2E]" />
              Productos <em className="not-italic text-[#C41B2E]">Destacados</em>
            </h2>
          </div>
        </AnimatedSection>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative select-none"
        >
          {/* Prev arrow */}
          {len > 1 && (
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8E2D9] flex items-center justify-center text-[#6B6159] hover:bg-white hover:text-[#C41B2E] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              aria-label="Anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Next arrow */}
          {len > 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8E2D9] flex items-center justify-center text-[#6B6159] hover:bg-white hover:text-[#C41B2E] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              aria-label="Siguiente"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="overflow-hidden rounded-3xl min-h-[520px] lg:min-h-[620px]">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={page}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) next()
                  else if (info.offset.x > 60) prev()
                }}
                className="bg-white border border-[#E8E2D9] shadow-sm cursor-grab active:cursor-grabbing"
              >
                <div className="flex flex-col lg:flex-row relative lg:justify-center">
                  {/* Badge top-left */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C41B2E] text-white text-[10px] font-bold rounded-lg shadow-lg shadow-[#C41B2E]/20">
                      <Star className="w-3 h-3 fill-white" />
                      {page + 1}/{len}
                    </span>
                  </div>

                  {/* Logo top-right */}
                  <img
                    src="/images/logo/Logo.png"
                    alt="Empero"
                    className="absolute top-6 right-6 h-14 lg:h-16 w-auto object-contain z-10"
                  />

                  {/* Image */}
                  <div className="lg:w-[420px] xl:w-[480px] flex-shrink-0 relative overflow-hidden">
                    <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px] bg-white flex items-center justify-center px-8 lg:px-10 py-4">
                      {product.cloudinary_url ? (
                        <img
                          src={productCardImage(product.cloudinary_url)}
                          alt={product.nombre}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-20 h-20 text-[#D8D0C6]" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 max-w-lg xl:max-w-xl p-10 lg:p-12 xl:p-14 flex flex-col justify-center">
                    <div className="mx-auto w-full">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C41B2E] mb-2.5">
                        {product.categoria}
                      </div>
                      <h3 className="text-2xl lg:text-3xl xl:text-[1.65rem] font-serif font-[560] text-[#1A1613] leading-tight">
                        {product.nombre}
                      </h3>
                      {product.etiqueta && (
                        <p className="text-sm text-[#9E9080] mt-2">{product.etiqueta}</p>
                      )}

                      {specs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {specs.map(s => (
                            <SpecPill key={s.icon.name || s.value?.toString()} icon={s.icon} value={s.value} />
                          ))}
                        </div>
                      )}

                      {features.length > 0 && (
                        <div className="mt-6 space-y-2.5">
                          {features.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-[#6B6159] leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C41B2E]/40 mt-[6px] flex-shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-8 flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={() => onViewDetails(product)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1613] text-white rounded-xl text-sm font-semibold hover:bg-[#2A2623] transition-all duration-200 shadow-sm cursor-pointer"
                        >
                          Ver detalles
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {onAddToQuote && (
                          <button
                            onClick={handleQuoteToggle}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                              isInQuoteList
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                                : 'bg-[#C41B2E] text-white hover:bg-[#B51426] shadow-sm'
                            }`}
                          >
                            {isInQuoteList ? <><Check className="w-4 h-4" /> En lista</> : <><Plus className="w-4 h-4" /> Agregar</>}
                          </button>
                        )}

                        <button
                          onClick={handleWhatsApp}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #25d366 0%, #1da851 100%)', boxShadow: '0 4px 12px rgba(37,211,102,0.25)' }}
                        >
                          <WhatsAppSVG className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          {len > 1 && (
            <div className="flex items-center justify-center gap-2.5 mt-8">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === page
                      ? 'w-10 h-2.5 bg-[#C41B2E]'
                      : 'w-2.5 h-2.5 bg-[#D8D0C6] hover:bg-[#C0B5A8]'
                  }`}
                  aria-label={`Ir al producto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmRemoveOpen}
        title={`¿Quitar "${product.nombre}" de tu lista?`}
        description="Vas a sacarlo de tu lista de cotización, pero podés volver a agregarlo cuando quieras."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          onRemoveFromQuote?.(product.id)
          setConfirmRemoveOpen(false)
        }}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </section>
  )
}
