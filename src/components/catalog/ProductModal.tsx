import { createPortal } from 'react-dom';
import { Check, Plus, X, Settings, Layers, Ruler, Weight, Box, ShoppingBasket, Power, Flame, Grid3X3, ShieldCheck, Award, MessageSquare, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { type Product } from '@/data/products';
import { variantLabel } from '@/lib/groupProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { AvailabilityBadge } from './AvailabilityBadge';
import { getLenis } from '@/hooks/useLenis';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { disponibilidadDeStock } from '@/lib/availability';
import { getProductWhatsAppURL } from '@/lib/whatsapp';

type WebkitBlurTarget = TargetAndTransition & { WebkitBackdropFilter?: string };

const PLACEHOLDER = '/images/Card/Noimagecard.png';

type TabValue = 'variantes' | 'specs' | 'caract' | 'accesorios';

// Soporta **negrita** estilo markdown en el comentario de "venta a medida" —
// alcanza con esto, no hace falta un parser de markdown completo.
function renderConNegrita(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-[#1A1613]">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

interface ProductModalProps {
  product: Product | null;
  variants?: Product[];
  isOpen: boolean;
  onClose: () => void;
  onAddToQuote?: (product: Product) => void;
  onRemoveFromQuote?: (productId: string) => void;
  quoteListIds?: string[];
}

export function ProductModal({
  product: initialProduct,
  variants,
  isOpen,
  onClose,
  onAddToQuote,
  onRemoveFromQuote,
  quoteListIds = [],
}: ProductModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('variantes');
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const allVariants = useMemo(
    () => (variants && variants.length > 0 ? variants : initialProduct ? [initialProduct] : []),
    [variants, initialProduct]
  );
  const hasVariants = allVariants.length > 1;
  // Family-level reference (nombre/categoría/imagen de respaldo) — siempre disponible mientras el modal está abierto,
  // aunque todavía no se haya elegido una variante puntual.
  const familyRef = initialProduct ?? allVariants[0] ?? null;

  useEffect(() => {
    if (isOpen) {
      // Con varias variantes, no se preselecciona ninguna: hay que elegir explícitamente.
      setSelectedId(hasVariants ? null : (allVariants[0]?.id ?? null));
      // Sin variantes no hay tab "Variantes" — arranca directo en specs.
      setActiveTab(hasVariants ? 'variantes' : 'specs');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialProduct?.id, hasVariants]);

  const product = allVariants.find(v => v.id === selectedId) ?? null;
  const needsSelection = hasVariants && !product;
  const isInQuoteList = product ? quoteListIds.includes(product.id) : false;

  // Lock / unlock scroll
  useEffect(() => {
    const lenis = getLenis();
    if (!isOpen) return;

    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const blockBgScroll = (e: TouchEvent) => {
      const scrollEl = scrollRef.current;
      if (scrollEl && scrollEl.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', blockBgScroll, { passive: false });

    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('touchmove', blockBgScroll);
    };
  }, [isOpen]);

  // Escape cierra — salvo que venga de un <dialog> nativo abierto encima
  // (la confirmación de "Quitar"), que maneja su propio Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if ((e.target as Element | null)?.closest?.('dialog[open]')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Modal accesible: el resto del sitio (#root) queda inerte — ni el foco ni
  // los lectores de pantalla salen del modal — y al cerrar el foco vuelve al
  // elemento que lo abrió.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    if (root) root.inert = true;
    const raf = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      if (root) root.inert = false;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setImageLoaded(false);
  }, [isOpen, familyRef?.id]);

  // Falls back to "specs" (without writing state) if the selected tab isn't available:
  // "accesorios" without accesorios, or "variantes" when there's only one producto.
  const hasAccesorios = (product?.accesorios_incluidos?.length ?? 0) > 0;
  const aclaracion = product?.aclaracion?.trim() || null;
  // La tab "Accesorios" también sirve de lugar para la aclaración — se muestra
  // si hay lo uno, lo otro, o ambos.
  const showAccesoriosTab = hasAccesorios || Boolean(aclaracion);
  const effectiveTab: TabValue =
    (activeTab === 'accesorios' && !showAccesoriosTab) || (activeTab === 'variantes' && !hasVariants)
      ? 'specs'
      : activeTab;
  const tabCount = (hasVariants ? 1 : 0) + 2 + (showAccesoriosTab ? 1 : 0);

  if (!familyRef) return null;

  const imageUrl = familyRef.familia_cloudinary_url ?? PLACEHOLDER;

  const handleSelectVariant = (id: string) => {
    setSelectedId(id);
  };

  const handleQuoteToggle = () => {
    if (!product) return;
    if (isInQuoteList) setConfirmRemoveOpen(true);
    else onAddToQuote?.(product);
  };

  // Specs (based on the currently selected variant)
  const specs: { label: string; value: string; icon: LucideIcon }[] = [];
  if (product) {
    const dim = product.dimensiones_mm;
    if (dim && (dim.Ancho || dim.Profundidad || dim.Alto || dim.Alto_min)) {
      const alto = dim.Alto != null
        ? `${dim.Alto}`
        : (dim.Alto_min != null && dim.Alto_max != null ? `${dim.Alto_min}–${dim.Alto_max}` : '—');
      specs.push({ label: 'Dimensiones', value: `${dim.Ancho ?? '—'} × ${dim.Profundidad ?? '—'} × ${alto} mm`, icon: Ruler });
    }
    if (product.capacidad)          specs.push({ label: 'Capacidad',   value: product.capacidad.replace(/bandejas?/gi, ' ').replace(/\s+/g, ' ').trim(), icon: Layers });
    if (product.peso_kg != null)    specs.push({ label: 'Peso',        value: `${product.peso_kg} kg`, icon: Weight });
    if (product.volumen_m3 != null) specs.push({ label: 'Volumen',     value: `${product.volumen_m3} m³`, icon: Box });
    if (product.dimensiones_canasto_mm) specs.push({ label: 'Canasto', value: product.dimensiones_canasto_mm, icon: ShoppingBasket });
    if (product.rejilla_mm)         specs.push({ label: 'Rejilla',     value: `${product.rejilla_mm} mm`, icon: Grid3X3 });
    if (product.potencia_kw != null) specs.push({ label: 'Potencia',   value: `${product.potencia_kw} kW`, icon: Power });
    if (product.consumo_gas_m3h != null) specs.push({ label: 'Consumo de gas', value: `${product.consumo_gas_m3h} m³/h`, icon: Flame });
  }

  const hasSpecs  = specs.length > 0;
  const caracteristicas = product?.caracteristicas_generales ?? familyRef.familia_caracteristicas_generales ?? [];
  const hasCaract = caracteristicas.length > 0;
  // Venta a medida: reemplaza el panel de specs técnicas por un comentario
  // libre (ver ProductForm admin) — no aplica a "Características".
  const esAMedida = Boolean(product?.venta_a_medida);
  const comentarioMedida = product?.comentario_medida ?? null;

  const trustBadges: { icon: LucideIcon; text: string }[] = [
    { icon: ShieldCheck, text: 'Equipamiento profesional de alta performance' },
    { icon: Settings,    text: 'Diseñado para uso intensivo y continuo' },
    { icon: Award,       text: 'Materiales de alta calidad y máxima durabilidad' },
  ];

  const tabTriggerCls = 'rounded-lg text-[12px] font-semibold text-[#6B6159] data-[state=active]:bg-white data-[state=active]:text-[#C41B2E] data-[state=active]:shadow-sm';

  // Venta a medida: panel destacado con ícono arriba para llamar la atención
  // sobre el comentario — reemplaza las specs técnicas en los tres layouts
  // del modal (con variantes, sin variantes desktop, sin variantes mobile).
  const comentarioPanel = (
    <div className="rounded-2xl border border-[#F5C5C9] bg-[#FFF8F7] p-6 lg:p-7 flex flex-col items-center text-center">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF0F1] border border-[#F5C5C9] mb-2.5 flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-[#C41B2E]" strokeWidth={2} />
      </span>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#C41B2E] mb-2.5">Importante</p>
      <p className="text-[13.5px] text-[#3A3530] leading-relaxed whitespace-pre-line text-left">
        {renderConNegrita(comentarioMedida || 'Consultar por especificaciones')}
      </p>
    </div>
  );

  const specsPanel = needsSelection ? (
    <p className="text-[13px] text-[#9A8E82] italic text-center py-10">Elegí una variante para ver sus especificaciones.</p>
  ) : esAMedida ? (
    comentarioPanel
  ) : hasSpecs ? (
    <div className="rounded-2xl border border-[#EBE5DC] overflow-hidden bg-white divide-y divide-[#F0EAE2]">
      {specs.map(s => (
        <div key={s.label} className="flex items-center justify-between gap-2 px-5 py-3.5">
          <span className="flex items-center gap-2.5 min-w-0">
            <s.icon className="w-[17px] h-[17px] text-[#C41B2E] flex-shrink-0" />
            <span className="text-[13px] text-[#6B6159] font-medium truncate">{s.label}</span>
          </span>
          <span className="font-semibold text-[#1A1613] text-right ml-3 flex-shrink-0 text-[13.5px]">{s.value}</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-[13px] text-[#9A8E82] italic text-center py-10">Consultar por especificaciones</p>
  );

  const caractPanel = hasCaract ? (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 rounded-2xl border border-[#EBE5DC] bg-white p-5">
      {caracteristicas.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[#3A3530] leading-snug text-[13.5px]">
          <span className="w-[18px] h-[18px] rounded-full bg-[#FFF0F1] border border-[#F5C5C9] flex items-center justify-center flex-shrink-0 mt-[1px]">
            <Check className="w-2.5 h-2.5 text-[#C41B2E]" strokeWidth={2.5} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-[13px] text-[#9A8E82] italic text-center py-10">Consultar por características</p>
  );

  const accesorios = product?.accesorios_incluidos ?? [];
  const accesoriosPanel = showAccesoriosTab && (
    <div className="space-y-4">
      {hasAccesorios && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 rounded-2xl border border-[#EBE5DC] bg-white p-5">
          {accesorios.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[#3A3530] leading-snug text-[13.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C41B2E] flex-shrink-0 mt-[6px]" />
              {a}
            </li>
          ))}
        </ul>
      )}
      {aclaracion && (
        <p className="text-[13px] text-[#6B6159] italic leading-relaxed rounded-2xl border border-[#EBE5DC] bg-[#FAF8F5] p-4">
          {aclaracion}
        </p>
      )}
    </div>
  );

  const variantesPanel = (
    <div>
      <AnimatePresence initial={false}>
        {needsSelection && (
          <motion.p
            key="needs-selection-hint"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-[12.5px] text-[#9A8E82] overflow-hidden"
          >
            Elegí una variante para ver precio, stock y especificaciones.
          </motion.p>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {allVariants.map(v => {
        const active = v.id === product?.id;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelectVariant(v.id)}
            className={`group relative text-left px-4 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-[#FFF0F1] border-[#C41B2E] shadow-[0_8px_24px_rgba(196,27,46,0.12)]'
                : 'bg-white border-[#E8E2D9] hover:border-[#C41B2E]/50 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`text-[14px] font-bold leading-snug ${active ? 'text-[#C41B2E]' : 'text-[#1A1613]'}`}>
                {variantLabel(v)}
              </span>
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                  active ? 'bg-[#C41B2E] border-[#C41B2E]' : 'border-[#D8D0C4] group-hover:border-[#C41B2E]/50'
                }`}
              >
                {active && <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#9A8E82] truncate">{v.codigo}</span>
              <AvailabilityBadge modo={disponibilidadDeStock(v.stock)} size="sm" />
            </div>
            {v.mostrar_precio && v.precio_usd != null && (
              <p className={`text-[13.5px] mt-2.5 pt-2.5 border-t font-bold ${active ? 'border-[#F5C5C9] text-[#C41B2E]' : 'border-[#F0EAE2] text-[#1A1613]'}`}>
                US$ {Number(v.precio_usd).toLocaleString('es-AR')}
              </p>
            )}
          </button>
        );
      })}
      </div>
    </div>
  );

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60"
            style={{ backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
            initial={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' } as WebkitBlurTarget}
            animate={{ opacity: 1, backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)' } as WebkitBlurTarget}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' } as WebkitBlurTarget}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Centering wrapper */}
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 lg:p-4 pointer-events-none">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative w-full h-[100dvh] rounded-none lg:h-[90dvh] lg:max-h-[860px] lg:w-[94vw] lg:max-w-[1400px] lg:rounded-2xl lg:overflow-hidden bg-white pointer-events-auto"
              style={{
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.15)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: -12,
                transition: { duration: 0.22, ease: [0.5, 0, 0.75, 0] },
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.3 },
              }}
            >
              {/* Close */}
              <motion.button
                type="button"
                data-autofocus
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 z-30 w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-full lg:rounded-lg bg-white/90 lg:bg-white backdrop-blur-sm lg:backdrop-blur-none shadow-sm lg:shadow-md border border-transparent lg:border-[#E8E2D9] text-[#6B6159] hover:text-[#C41B2E] hover:bg-[#FFF0F1] hover:border-[#C41B2E]/30 hover:shadow-lg transition-colors duration-200 lg:duration-150 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                <X className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
              </motion.button>

              {/* Availability badge (mobile, top-left) */}
              {product && (
                <div className="lg:hidden absolute top-3.5 left-3.5 z-30 shadow-sm rounded-md">
                  <AvailabilityBadge modo={disponibilidadDeStock(product.stock)} size="md" />
                </div>
              )}

              {/* Grid: image | details */}
              <div className="flex flex-col lg:grid lg:grid-cols-[44%_56%]" style={{ flex: 1, minHeight: 0 }}>

                {/* Image panel (desktop) */}
                <div className="relative bg-white lg:h-full overflow-hidden flex-shrink-0 hidden lg:flex lg:flex-col">
                  <div className="flex-1 relative min-h-0">
                    {!imageLoaded && <div className="absolute inset-0 bg-[#EEEAE1] animate-pulse" />}
                    <motion.img
                      src={imageUrl}
                      alt={familyRef.familia_nombre}
                      width={420}
                      height={494}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-contain p-8"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={imageLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      onLoad={() => setImageLoaded(true)}
                    />

                    {product && (
                      <div className="absolute top-6 left-6">
                        <AvailabilityBadge modo={disponibilidadDeStock(product.stock)} size="md" />
                      </div>
                    )}

                    <AnimatePresence>
                      {isInQuoteList && (
                        <motion.div
                          className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-md"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                        >
                          <Check className="w-3 h-3" />
                          En tu lista
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-3 gap-2 px-5 py-6 bg-white border-t border-[#EBE5DC] min-h-[140px] items-center">
                    {trustBadges.map((b, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 text-center min-w-0">
                        <b.icon className="w-7 h-7 text-[#C41B2E] flex-shrink-0" strokeWidth={2} />
                        <span className="text-[11px] leading-snug text-[#6B6159] font-medium">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details panel */}
                <div className="flex-1 flex flex-col min-h-0 lg:overflow-hidden lg:bg-white">

                  <div className="modal-product-header hidden lg:flex lg:items-start lg:justify-between lg:gap-8 lg:px-10 lg:pt-14 lg:pb-0">
                    <div className="min-w-0">
                      <div className="modal-product-header-category-row">
                        <span className="modal-product-header-category lg:text-[15px] lg:tracking-[0.14em]">{familyRef.familia_categoria}</span>
                      </div>
                      <h2 id={titleId} className="modal-product-header-title lg:pr-0">{familyRef.familia_nombre}</h2>
                      {/* Con variantes, el código de cada una ya se ve en la tab "Variantes" —
                         acá solo hace falta para el producto único, que no tiene esa tab. */}
                      {!hasVariants && product && (
                        <p className="mt-1.5 text-[12px] font-mono text-[#9A8E82]">{product.codigo}</p>
                      )}
                    </div>

                    <img
                      src="/images/logo/Logo.png"
                      alt=""
                      width={480}
                      height={333}
                      className="h-14 w-auto object-contain flex-shrink-0 lg:mt-6"
                    />
                  </div>

                  {/* Scrollable content — includes mobile hero so touch anywhere scrolls */}
                  <div
                    ref={scrollRef}
                    data-lenis-prevent
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-10 pb-3 max-lg:px-0 max-lg:pb-4 flex flex-col"
                    style={{ touchAction: 'pan-y' }}
                  >
                    {/* ===== MOBILE HERO (inside scroll so any touch scrolls) ===== */}
                    <div className="lg:hidden px-4 pt-14 pb-3.5">
                      <div className="flex gap-3.5">
                        {/* Thumbnail */}
                        <div className="w-[164px] flex-shrink-0 self-start aspect-[3/4] rounded-xl overflow-hidden bg-[var(--warm-50)] border border-[#EBE5DC] relative">
                          {!imageLoaded && <div className="absolute inset-0 bg-[#E6E0D7] animate-pulse" />}
                          <CloudinaryImage
                            src={familyRef.familia_cloudinary_url}
                            alt={familyRef.familia_nombre}
                            width={164}
                            height={218}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            placeholderClass="absolute inset-0 w-full h-full object-contain p-2.5"
                            sizes="164px"
                            onLoad={() => setImageLoaded(true)}
                          />
                        </div>
                        {/* Logo + categoría + título */}
                        <div className="flex-1 min-w-0">
                          <img src="/images/logo/Logo.png" alt="" width={480} height={333} className="h-14 w-auto object-contain object-left mt-3.5 mb-2.5" />
                          <span className="modal-product-header-category block mb-1">{familyRef.familia_categoria}</span>
                          <p className="modal-product-header-title !pr-0 !text-[1.15rem] !leading-[1.2]" aria-hidden="true">{familyRef.familia_nombre}</p>
                          {!hasVariants && product && (
                            <p className="mt-1 text-[11px] font-mono text-[#9A8E82]">{product.codigo}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tabs unificado: con variantes agrega el tab "Variantes" adelante;
                       sin variantes, arranca directo en Especificaciones/Comentario.
                       El TabsList queda sticky arriba del scroll — el padding superior que
                       antes tenía el contenedor de scroll ahora vive DENTRO del bloque
                       sticky (pt-5 acá, no pt-5 en scrollRef) para que no haya ningún hueco
                       que el sticky tenga que "atravesar" antes de fijarse: queda pegado
                       arriba desde el primer pixel de scroll, sin saltos. */}
                    <div className="px-3.5 pb-4 lg:px-0 lg:pb-0">
                      <Tabs value={effectiveTab} onValueChange={v => setActiveTab(v as TabValue)}>
                        <div className="sticky top-0 z-20 bg-white pt-0 lg:pt-5 pb-4">
                          <TabsList className={`grid w-full h-10 bg-[#F4F0E8] rounded-xl p-1 ${
                            tabCount === 4 ? 'grid-cols-4' : tabCount === 3 ? 'grid-cols-3' : 'grid-cols-2'
                          }`}>
                            {hasVariants && <TabsTrigger value="variantes" className={tabTriggerCls}>Variantes</TabsTrigger>}
                            <TabsTrigger value="specs" className={tabTriggerCls}>{esAMedida ? 'Comentario' : 'Especificaciones'}</TabsTrigger>
                            <TabsTrigger value="caract" className={tabTriggerCls}>Características</TabsTrigger>
                            {showAccesoriosTab && <TabsTrigger value="accesorios" className={tabTriggerCls}>Accesorios</TabsTrigger>}
                          </TabsList>
                        </div>

                        {hasVariants && <TabsContent value="variantes" className="mt-0">{variantesPanel}</TabsContent>}
                        <TabsContent value="specs" className="mt-0">{specsPanel}</TabsContent>
                        <TabsContent value="caract" className="mt-0">{caractPanel}</TabsContent>
                        {showAccesoriosTab && <TabsContent value="accesorios" className="mt-0">{accesoriosPanel}</TabsContent>}
                      </Tabs>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex-shrink-0 px-5 py-5 border-t border-[#EBE5DC] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:shadow-none lg:min-h-[140px] lg:flex lg:flex-col lg:justify-center">
                    {needsSelection && (
                      <p role="status" className="text-center text-[12px] font-semibold text-[#C41B2E] mb-2.5">
                        Elegí una variante para continuar
                      </p>
                    )}
                    <div className="flex gap-2 lg:gap-4">
                      {product ? (
                        <motion.a
                          href={getProductWhatsAppURL(product.nombre, product.codigo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Consultar ${product.nombre} por WhatsApp`}
                          className="flex-1 h-12 lg:h-16 rounded-xl lg:rounded-2xl text-[13px] lg:text-[17px] font-semibold flex items-center justify-center gap-2 lg:gap-3 text-white bg-gradient-to-br from-[#25d366] to-[#1da851] shadow-[0_4px_14px_rgba(37,211,102,0.28)]"
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <WhatsAppIcon className="w-4 h-4 lg:w-6 lg:h-6 flex-shrink-0" />
                          WhatsApp
                        </motion.a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 h-12 lg:h-16 rounded-xl lg:rounded-2xl text-[13px] lg:text-[17px] font-semibold flex items-center justify-center gap-2 lg:gap-3 text-white bg-gradient-to-br from-[#25d366] to-[#1da851] opacity-40 cursor-not-allowed"
                        >
                          <WhatsAppIcon className="w-4 h-4 lg:w-6 lg:h-6 flex-shrink-0" />
                          WhatsApp
                        </button>
                      )}

                      <motion.button
                        type="button"
                        className={`flex-1 h-12 lg:h-16 rounded-xl lg:rounded-2xl text-[13px] lg:text-[17px] font-semibold flex items-center justify-center gap-1.5 lg:gap-2.5 transition-colors duration-200 lg:duration-150 border ${
                          needsSelection
                            ? 'opacity-40 cursor-not-allowed pointer-events-none bg-[#C41B2E] text-white border-[#C41B2E]'
                            : isInQuoteList
                              ? 'cursor-pointer bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                              : 'cursor-pointer bg-[#C41B2E] text-white border-[#C41B2E] hover:bg-[#B51426] shadow-sm shadow-red-900/20'
                        }`}
                        onClick={handleQuoteToggle}
                        disabled={needsSelection}
                        whileHover={needsSelection ? undefined : { scale: 1.015 }}
                        whileTap={needsSelection ? undefined : { scale: 0.97 }}
                      >
                        {isInQuoteList
                          ? <><X className="w-3.5 h-3.5 lg:w-5 lg:h-5" aria-hidden="true" /> Quitar de la lista</>
                          : <><Plus className="w-3.5 h-3.5 lg:w-5 lg:h-5" aria-hidden="true" /> Agregar a lista</>
                        }
                      </motion.button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ConfirmDialog
        isOpen={confirmRemoveOpen}
        title="¿Quitar producto?"
        description={product ? `Vas a sacar "${product.nombre}" de tu lista de cotización.` : undefined}
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (product) onRemoveFromQuote?.(product.id);
          setConfirmRemoveOpen(false);
        }}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </>
  );
}
