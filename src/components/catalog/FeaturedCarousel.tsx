import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Product } from '@/data/products'
import { SectionHeader } from '@/components/SectionHeader'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { AvailabilityBadge } from './AvailabilityBadge'
import { ListedTag } from './ListedTag'
import type { QuoteQuantities } from '@/hooks/useQuoteList'
import { disponibilidadDeStock } from '@/lib/availability'
import { prefersReducedMotion } from '@/lib/scroll'

interface Props {
  products: Product[]
  onViewDetails: (product: Product) => void
  quoteQuantities?: QuoteQuantities
}

// Carrusel de destacados con scroll nativo + scroll-snap: se desliza con el
// dedo, la rueda o el teclado (el track es enfocable) sin JS de arrastre.
// Los botones Anterior/Siguiente desplazan al slide vecino según la posición
// real del scroll, se deshabilitan en los extremos (moviendo el foco al otro
// botón) y una región polite anuncia qué productos quedaron a la vista.
export function FeaturedCarousel({ products, onViewDetails, quoteQuantities = {} }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const [current, setCurrent] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const userNavigated = useRef(false)

  const len = products.length

  const slides = useCallback(
    () => Array.from(trackRef.current?.children ?? []) as HTMLElement[],
    []
  )

  // Índice del primer slide visible, según la posición del scroll.
  const readIndex = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    const left = track.scrollLeft
    let best = 0
    let bestDist = Infinity
    slides().forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - track.offsetLeft - left)
      if (d < bestDist) { bestDist = d; best = i }
    })
    return best
  }, [slides])

  const syncState = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const start = track.scrollLeft <= 2
    const end = track.scrollLeft >= max - 2
    setOverflowing(max > 2)
    setAtStart(start)
    setAtEnd(end)
    setCurrent(readIndex())

    // Si el botón con foco quedó deshabilitado, el foco pasa al otro.
    if (start && document.activeElement === prevRef.current) nextRef.current?.focus()
    if (end && document.activeElement === nextRef.current) prevRef.current?.focus()
  }, [readIndex])

  // Estado inicial + al cambiar el tamaño del track.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(() => syncState())
    ro.observe(track)
    return () => ro.disconnect()
  }, [syncState, len])

  // Scroll: estado de botones en vivo (1 vez por frame) y anuncio al terminar.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    let settleTimer: ReturnType<typeof setTimeout> | undefined

    const settle = () => {
      syncState()
      if (!userNavigated.current) return
      userNavigated.current = false
      const first = readIndex()
      const prod = products[first]
      if (prod) setAnnouncement(`Mostrando desde el producto ${first + 1} de ${len}: ${prod.nombre}`)
    }
    // Un solo "settle" por gesto: scrollend cuando el navegador lo emite;
    // si no llega (soporte parcial), lo resuelve un debounce del scroll.
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncState)
      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, 180)
    }
    const onScrollEnd = () => {
      clearTimeout(settleTimer)
      settle()
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('scrollend', onScrollEnd)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settleTimer)
      track.removeEventListener('scroll', onScroll)
      track.removeEventListener('scrollend', onScrollEnd)
    }
  }, [syncState, readIndex, products, len])

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current
    const target = slides()[Math.max(0, Math.min(index, len - 1))]
    if (!track || !target) return
    userNavigated.current = true
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [slides, len])

  if (!len) return null

  return (
    <section
      aria-roledescription="carrusel"
      aria-labelledby="destacados-title"
      className="py-14 sm:py-16 lg:py-20 bg-[var(--page-bg)] relative overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] max-w-full h-[37.5rem] rounded-full bg-brand/[0.03] blur-[120px]" />
      </div>

      <div className="featured-scope relative container-custom">
        <SectionHeader
          eyebrow="Lo más destacado"
          titleId="destacados-title"
          title="Productos"
          accent="Destacados"
          className="mb-8 sm:mb-10"
        />

        {/* Controles: van antes del track en el orden del DOM */}
        <div className={`mb-4 flex items-center justify-end gap-3 ${overflowing ? '' : 'hidden'}`}>
          <span className="font-mono text-[0.75rem] text-ink-500 tabular-nums" aria-hidden="true">
            {String(current + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
          </span>
          <button
            ref={prevRef}
            type="button"
            onClick={() => scrollToIndex(readIndex() - 1)}
            disabled={atStart}
            className="carousel-btn"
            aria-label="Productos anteriores"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            ref={nextRef}
            type="button"
            onClick={() => scrollToIndex(readIndex() + 1)}
            disabled={atEnd}
            className="carousel-btn"
            aria-label="Productos siguientes"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={trackRef}
          className="featured-track"
          tabIndex={0}
          role="group"
          aria-label="Productos destacados"
        >
          {products.map((product, i) => {
            const listedQty = quoteQuantities[product.id] ?? 0
            return (
              <article
                key={product.id}
                role="group"
                aria-roledescription="producto"
                aria-label={`${i + 1} de ${len}`}
                className={`featured-card ${listedQty > 0 ? 'featured-card--in-list' : ''}`}
              >
                <div className="featured-card__media">
                  <CloudinaryImage
                    src={product.cloudinary_url ?? product.familia_cloudinary_url}
                    alt=""
                    width={480}
                    height={360}
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 82vw"
                    className="featured-card__img w-full h-full object-contain"
                    placeholderClass="w-full h-full object-contain p-10 opacity-70"
                  />
                  <span className="featured-card__badge">Destacado</span>
                  <div className="absolute top-3 right-3 z-[2] pointer-events-none">
                    <AvailabilityBadge modo={disponibilidadDeStock(product.stock)} size="sm" />
                  </div>
                  {listedQty > 0 && (
                    <div className="card-listed">
                      <ListedTag quantity={listedQty} />
                    </div>
                  )}
                </div>

                <div className="featured-card__body">
                  <p className="product-card-category">{product.categoria}</p>
                  <h3 className="featured-card__title">
                    <button
                      type="button"
                      className="featured-card__link"
                      onClick={() => onViewDetails(product)}
                      aria-label={`${product.nombre}, modelo ${product.codigo}${listedQty > 0 ? ', en tu lista' : ''}. Ver detalles`}
                    >
                      {product.nombre}
                    </button>
                  </h3>
                  {/* Mismo pie que las cards del catálogo: código de modelo + afordancia */}
                  <div className="featured-card__actions" aria-hidden="true">
                    <span className="product-card__meta font-mono">{product.codigo}</span>
                    <span className="featured-card__cta">
                      Ver detalles
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Progreso del scroll (scroll-driven animation; decorativo) */}
        {overflowing && (
          <div aria-hidden="true" className="featured-progress mt-6">
            <span className="featured-progress__bar" />
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      </div>
    </section>
  )
}
