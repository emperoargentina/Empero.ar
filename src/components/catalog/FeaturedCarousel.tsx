import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Ruler, Weight, Zap, Flame, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import type { Product } from '@/data/products'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { getProductWhatsAppURL } from '@/lib/whatsapp'
import { prefersReducedMotion } from '@/lib/scroll'

interface Props {
  products: Product[]
  onViewDetails: (product: Product) => void
  onAddToQuote?: (product: Product) => void
  onRemoveFromQuote?: (productId: string) => void
  quoteListIds?: string[]
}

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
const AUTOPLAY_MS = 7500

// Carrusel accesible: región con aria-roledescription, slides etiquetadas
// "N de M", anuncio del producto al navegar, botón visible de pausa
// (WCAG 2.2.2) y autoplay que se detiene con hover, foco, pestaña oculta,
// fuera de pantalla o prefers-reduced-motion (arranca pausado).
export function FeaturedCarousel({ products, onViewDetails }: Props) {
  const [[page, dir], setPage] = useState([0, 0])
  const [userPaused, setUserPaused] = useState(prefersReducedMotion)
  const [hovering, setHovering] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [visible, setVisible] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [maxFeatures, setMaxFeatures] = useState(MAX_FEATURES)
  const sectionRef = useRef<HTMLElement>(null)
  const contentBoxRef = useRef<HTMLDivElement>(null)
  const contentInnerRef = useRef<HTMLDivElement>(null)

  const len = products.length
  const paused = userPaused || hovering || focusWithin || !visible

  const paginate = useCallback((newDir: number) => {
    setPage(([p]) => [(p + newDir + len) % len, newDir])
  }, [len])

  // Navegación del usuario: además de mover, anuncia el producto.
  const navigate = useCallback((target: number, direction: number) => {
    const index = (target + len) % len
    setPage([index, direction])
    const prod = products[index]
    if (prod) setAnnouncement(`Producto ${index + 1} de ${len}: ${prod.nombre}`)
  }, [len, products])

  const next = useCallback(() => navigate(page + 1, 1), [navigate, page])
  const prev = useCallback(() => navigate(page - 1, -1), [navigate, page])
  const goTo = useCallback((i: number) => navigate(i, i > page ? 1 : -1), [navigate, page])

  // Solo corre el autoplay mientras el carrusel está en pantalla y la pestaña visible.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && document.visibilityState === 'visible')
    }, { threshold: 0.35 })
    io.observe(el)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setVisible(false)
      else {
        const rect = el.getBoundingClientRect()
        setVisible(rect.top < window.innerHeight && rect.bottom > 0)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (len <= 1 || paused) return
    const timer = setInterval(() => paginate(1), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [len, paused, paginate])

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

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carrusel"
      aria-labelledby="destacados-title"
      className="py-12 sm:py-16 lg:py-20 bg-[var(--page-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#C41B2E]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <AnimatedSection direction="up">
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Lo más destacado
              </span>
              <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
            <h2 id="destacados-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-[560] text-[#1A1613] flex items-center justify-center gap-[0.25em]">
              Productos <em className="not-italic text-[#C41B2E]">Destacados</em>
            </h2>
          </div>
        </AnimatedSection>

        <div
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovering(true) }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHovering(false) }}
          onFocus={() => setFocusWithin(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false) }}
          className="relative select-none"
        >
          <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-20px_rgba(26,22,19,0.18)]">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={page}
                role="group"
                aria-roledescription="producto"
                aria-label={`${page + 1} de ${len}`}
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
                style={{ touchAction: 'pan-y' }}
                className="bg-white border border-[#E8E2D9] cursor-grab active:cursor-grabbing"
              >
                <div className="flex flex-col lg:flex-row relative lg:justify-center">
                  {/* Top hairline — same signature red glow as the footer/header dividers */}
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C41B2E]/50 to-transparent z-10" />

                  {/* Badge top-left */}
                  <span className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C41B2E] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-[#C41B2E]/25">
                    <Star className="w-3 h-3 fill-white" aria-hidden="true" />
                    Destacado
                  </span>

                  {/* Logo — quiet watermark, not competing with the product */}
                  <img
                    src="/images/logo/Logo.png"
                    alt=""
                    width={480}
                    height={333}
                    loading="lazy"
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 h-9 sm:h-12 lg:h-14 w-auto object-contain opacity-60 z-10"
                  />

                  {/* Image — blends straight into the white card, fixed height keeps every slide the same size */}
                  <div className="lg:w-[440px] xl:w-[520px] flex-shrink-0 p-4 sm:p-5 xl:p-5">
                    <div className="relative overflow-hidden h-[200px] sm:h-[260px] lg:h-full flex items-center justify-center px-4 py-6">
                      <CloudinaryImage
                        src={product.cloudinary_url ?? product.familia_cloudinary_url}
                        alt={product.nombre}
                        width={480}
                        height={640}
                        sizes="(min-width: 1280px) 480px, (min-width: 1024px) 400px, 80vw"
                        className="w-full h-full object-contain"
                        placeholderClass="w-full h-full object-contain p-6"
                      />
                    </div>
                  </div>

                  {/* Content — fixed height so every slide matches; overflow is resolved by trimming bullet points */}
                  <div
                    ref={contentBoxRef}
                    className="flex-1 max-w-xl p-6 sm:p-8 lg:p-10 xl:p-10 pt-10 sm:pt-12 lg:pt-14 flex flex-col relative overflow-hidden h-[360px] sm:h-[400px] lg:h-[480px] xl:h-[500px]"
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
                              <span className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#7B7064] flex-shrink-0">
                                <s.icon className="w-3 h-3 text-[#C41B2E]/70" aria-hidden="true" />
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
                          type="button"
                          onClick={() => onViewDetails(product)}
                          aria-label={`Ver detalles de ${product.nombre}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C41B2E] text-white rounded-lg text-sm font-semibold hover:bg-[#B51426] transition-colors duration-200 shadow-sm cursor-pointer"
                        >
                          Ver detalles
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>

                        <a
                          href={getProductWhatsAppURL(product.nombre, product.codigo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Consultar ${product.nombre} por WhatsApp`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1EAF56] hover:bg-[#178F46] transition-colors duration-200 shadow-sm"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Editorial pagination — progress ticks + prev/next, one consistent control at every breakpoint */}
          {len > 1 && (
            <div className="flex items-center gap-2 sm:gap-4 mt-6 sm:mt-7">
              <button
                type="button"
                onClick={() => setUserPaused(p => !p)}
                className="carousel-btn"
                aria-label={userPaused ? 'Reproducir carrusel' : 'Pausar carrusel'}
              >
                {userPaused
                  ? <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  : <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />}
              </button>

              <button type="button" onClick={prev} className="carousel-btn" aria-label="Producto anterior">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex-1 flex items-center gap-1" role="group" aria-label="Elegir producto">
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === page ? 'true' : undefined}
                    aria-label={`Producto ${i + 1}: ${p.nombre}`}
                    className="carousel-marker group/marker relative flex-1 py-2.5 cursor-pointer"
                  >
                    <span className="block relative h-[3px] group-aria-[current=true]/marker:h-[5px] rounded-full bg-[#E8E2D9] group-hover/marker:bg-[#D8D0C6] transition-[height,background-color] duration-300 overflow-hidden">
                      {i === page && (
                        <motion.span
                          layoutId="featured-carousel-active-tick"
                          className="absolute inset-0 rounded-full bg-[#C41B2E]"
                          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <span className="flex-shrink-0 font-mono text-xs tracking-wide text-[#7B7064] tabular-nums" aria-hidden="true">
                {String(page + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
              </span>

              <button type="button" onClick={next} className="carousel-btn" aria-label="Producto siguiente">
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
