'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Package, Ruler, Weight, Zap, Flame, ArrowLeft, ArrowRight } from 'lucide-react'
import { productCardImage } from '@/lib/cloudinaryUrl'
import { whatsappConfig } from '@/data/company'
import type { Product } from '@/data/products'
import { AnimatedSection } from '@/components/animations/AnimatedSection'

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

function formatDim(dims: Product['dimensiones_mm']): string | null {
  if (!dims) return null
  if (dims.Ancho) return `${dims.Ancho}×${dims.Profundidad || '?'}×${dims.Alto || dims.Alto_max || '?'} mm`
  return null
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 56 : -56, opacity: 0, scale: 0.985 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0, scale: 0.985 }),
}

const MAX_FEATURES = 4

export function FeaturedCarousel({ products, onViewDetails }: Props) {
  const [[page, dir], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)
  const [maxFeatures, setMaxFeatures] = useState(MAX_FEATURES)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const contentBoxRef = useRef<HTMLDivElement>(null)
  const contentInnerRef = useRef<HTMLDivElement>(null)

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
    timerRef.current = setInterval(next, 7500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [len, paused, next])

  // Reset feature-trimming for the new slide during render (cheaper than an effect + extra pass).
  const [trimmedForPage, setTrimmedForPage] = useState(page)
  if (trimmedForPage !== page) {
    setTrimmedForPage(page)
    setMaxFeatures(MAX_FEATURES)
  }

  // Every card shares the same fixed height. If a product's content (specs + bullet points)
  // doesn't fit, drop bullet points one at a time until it does. This needs the actual rendered
  // DOM size, which only exists post-commit, so a layout effect is unavoidable here.
  useLayoutEffect(() => {
    const box = contentBoxRef.current
    const inner = contentInnerRef.current
    if (!box || !inner) return
    if (inner.scrollHeight > box.clientHeight && maxFeatures > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on measured layout, can't be derived during render
      setMaxFeatures(m => m - 1)
    }
  }, [maxFeatures, page])

  useEffect(() => {
    const box = contentBoxRef.current
    if (!box) return
    const ro = new ResizeObserver(() => setMaxFeatures(MAX_FEATURES))
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  if (!len) return null

  const product = products[page]

  const specs = [
    { icon: Ruler, label: 'Dimensiones', value: formatDim(product.dimensiones_mm) },
    { icon: Weight, label: 'Capacidad', value: product.capacidad },
    { icon: Zap, label: 'Potencia', value: product.potencia_kw != null ? `${product.potencia_kw} kW` : null },
    { icon: Flame, label: 'Consumo gas', value: product.consumo_gas_m3h != null ? `${product.consumo_gas_m3h} m³/h` : null },
  ].filter(s => s.value != null)

  const features = (product.caracteristicas_generales || []).slice(0, maxFeatures)

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(whatsappConfig.messageTemplate(product.nombre, product.codigo))
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${msg}`, '_blank')
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAFAF8] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#C41B2E]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <AnimatedSection direction="up">
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Lo más destacado
              </span>
              <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-[560] text-[#1A1613] flex items-center justify-center gap-2 sm:gap-3">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#C41B2E] flex-shrink-0" />
              Productos <em className="not-italic text-[#C41B2E]">Destacados</em>
            </h2>
          </div>
        </AnimatedSection>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative select-none"
        >
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-20px_rgba(26,22,19,0.18)]">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={page}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) next()
                  else if (info.offset.x > 60) prev()
                }}
                className="bg-white border border-[#E8E2D9] cursor-grab active:cursor-grabbing"
              >
                <div className="flex flex-col lg:flex-row relative lg:justify-center">
                  {/* Top hairline — same signature red glow as the footer/header dividers */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C41B2E]/50 to-transparent z-10" />

                  {/* Badge top-left */}
                  <span className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C41B2E] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-[#C41B2E]/25">
                    <Star className="w-3 h-3 fill-white" />
                    Destacado
                  </span>

                  {/* Logo — quiet watermark, not competing with the product */}
                  <img
                    src="/images/logo/Logo.png"
                    alt="Empero"
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 h-9 sm:h-12 lg:h-14 w-auto object-contain opacity-60 z-10"
                  />

                  {/* Image — blends straight into the white card, fixed height keeps every slide the same size */}
                  <div className="lg:w-[400px] xl:w-[460px] flex-shrink-0 p-5 sm:p-6 lg:p-8">
                    <div className="relative overflow-hidden h-[200px] sm:h-[260px] lg:h-full flex items-center justify-center px-6 sm:px-10 py-6">
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

                  {/* Content — fixed height so every slide matches; overflow is resolved by trimming bullet points */}
                  <div
                    ref={contentBoxRef}
                    className="flex-1 max-w-xl p-6 sm:p-8 lg:p-10 xl:p-12 pt-10 sm:pt-12 lg:pt-14 flex flex-col relative overflow-hidden h-[440px] sm:h-[480px] lg:h-[560px] xl:h-[580px]"
                  >
                    {/* Ghost index numeral — signature mark: this genuinely is page N of the set */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute -top-2 sm:top-0 right-2 sm:right-4 lg:right-6 font-serif font-[560] text-[5.5rem] sm:text-[7rem] lg:text-[8rem] leading-none text-[#C41B2E]/[0.06]"
                    >
                      {String(page + 1).padStart(2, '0')}
                    </span>

                    <div className="relative flex flex-col h-full" ref={contentInnerRef}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-px bg-[#C41B2E]" />
                        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#C41B2E]">
                          {product.categoria}
                        </span>
                      </div>

                      <h3 className="font-serif font-[560] text-2xl sm:text-3xl lg:text-[2.1rem] text-[#1A1613] leading-[1.1]">
                        {product.nombre}
                      </h3>
                      {product.etiqueta ? (
                        <p className="text-sm text-[#9E9080] mt-2">{product.etiqueta}</p>
                      ) : (
                        <div className="mt-2" />
                      )}

                      {specs.length > 0 && (
                        <div className="mt-6 border-t border-[#E8E2D9] divide-y divide-[#E8E2D9]">
                          {specs.map(s => (
                            <div key={s.label} className="flex items-center justify-between py-2 gap-4">
                              <span className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9E9080] flex-shrink-0">
                                <s.icon className="w-3 h-3 text-[#C41B2E]/70" />
                                {s.label}
                              </span>
                              <span className="font-mono text-xs sm:text-[13px] text-[#2C2825] text-right truncate">
                                {s.value}
                              </span>
                            </div>
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

                      {/* Ver detalles + WhatsApp — pinned to the bottom so both buttons land at the same height on every card */}
                      <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={() => onViewDetails(product)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C41B2E] text-white rounded-lg text-sm font-semibold hover:bg-[#B51426] transition-all duration-200 shadow-sm cursor-pointer"
                        >
                          Ver detalles
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={handleWhatsApp}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1EAF56] transition-all duration-200 cursor-pointer shadow-sm"
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

          {/* Editorial pagination — progress ticks + prev/next, one consistent control at every breakpoint */}
          {len > 1 && (
            <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-7">
              <button
                onClick={prev}
                className="flex-shrink-0 w-9 h-9 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6159] hover:border-[#C41B2E]/40 hover:text-[#C41B2E] transition-colors duration-200 cursor-pointer"
                aria-label="Anterior"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center gap-1.5">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="relative flex-1 h-[3px] rounded-full bg-[#E8E2D9] hover:bg-[#D8D0C6] transition-colors duration-300 cursor-pointer overflow-hidden"
                    aria-label={`Ir al producto ${i + 1}`}
                  >
                    {i === page && (
                      <motion.span
                        layoutId="featured-carousel-active-tick"
                        className="absolute inset-0 rounded-full bg-[#C41B2E]"
                        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <span className="flex-shrink-0 font-mono text-xs tracking-wide text-[#9E9080]">
                {String(page + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
              </span>

              <button
                onClick={next}
                className="flex-shrink-0 w-9 h-9 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6159] hover:border-[#C41B2E]/40 hover:text-[#C41B2E] transition-colors duration-200 cursor-pointer"
                aria-label="Siguiente"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
