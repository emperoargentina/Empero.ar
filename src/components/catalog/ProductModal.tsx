import { createPortal } from 'react-dom';
import { Check, Plus, Minus, Trash2, X, Layers, Ruler, Weight, Box, ShoppingBasket, Power, Flame, Grid3X3, ShieldCheck, Settings, Award, MessageSquare, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { type Product } from '@/data/products';
import { variantLabel } from '@/lib/groupProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { AvailabilityBadge } from './AvailabilityBadge';
import { getLenis } from '@/hooks/useLenis';
import { prefersReducedMotion } from '@/lib/scroll';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { disponibilidadDeStock } from '@/lib/availability';
import { getProductWhatsAppURL } from '@/lib/whatsapp';
import type { QuoteQuantities } from '@/hooks/useQuoteList';
import { ListedTag } from './ListedTag';


const PLACEHOLDER = '/images/Card/Noimagecard.png';

type TabValue = 'variantes' | 'specs' | 'caract' | 'accesorios';

// Soporta **negrita** estilo markdown en el comentario de "venta a medida" —
// alcanza con esto, no hace falta un parser de markdown completo.
function renderConNegrita(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-ink-900">{part.slice(2, -2)}</strong>
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
  onUpdateQuoteQuantity?: (productId: string, quantity: number) => void;
  quoteQuantities?: QuoteQuantities;
}

const MAX_QTY = 999;
const ADDED_FEEDBACK_MS = 1500;
const NO_QUANTITIES: QuoteQuantities = {};

export function ProductModal({
  product: initialProduct,
  variants,
  isOpen,
  onClose,
  onAddToQuote,
  onRemoveFromQuote,
  onUpdateQuoteQuantity,
  quoteQuantities = NO_QUANTITIES,
}: ProductModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('variantes');
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  // Variante recién agregada: muestra la confirmación animada unos segundos
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Última lista conocida, para elegir variante al abrir sin reabrir al cambiarla
  const quantitiesRef = useRef(quoteQuantities);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
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
    quantitiesRef.current = quoteQuantities;
  }, [quoteQuantities]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  useEffect(() => {
    if (isOpen) {
      // Con varias variantes no se preselecciona ninguna (hay que elegir), salvo
      // que alguna ya esté en la lista: se abre en esa para ver y ajustar la
      // cantidad. Si se abrió desde la lista, gana el producto clickeado.
      const listed = allVariants.filter(v => (quantitiesRef.current[v.id] ?? 0) > 0);
      const preferred = listed.find(v => v.id === initialProduct?.id) ?? listed[0];
      setSelectedId(hasVariants ? (preferred?.id ?? null) : (allVariants[0]?.id ?? null));
      // Sin variantes no hay tab "Variantes" — arranca directo en specs.
      setActiveTab(hasVariants ? 'variantes' : 'specs');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialProduct?.id, hasVariants]);

  const product = allVariants.find(v => v.id === selectedId) ?? null;
  const needsSelection = hasVariants && !product;
  const quoteQty = product ? (quoteQuantities[product.id] ?? 0) : 0;
  const isInQuoteList = quoteQty > 0;
  const showAdded = Boolean(product && justAddedId === product.id);

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

  if (!familyRef) return null;

  const imageUrl = familyRef.familia_cloudinary_url ?? PLACEHOLDER;

  // En pantallas angostas las pestañas se deslizan: la elegida queda centrada
  // (así se ve también la vecina, que invita a seguir).
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    requestAnimationFrame(() => {
      const list = tabsListRef.current;
      const tab = list?.querySelector<HTMLElement>('[data-state="active"]');
      if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
      list.scrollTo({
        left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
  };

  const handleSelectVariant = (id: string) => {
    setSelectedId(id);
  };

  const handleAdd = () => {
    if (!product || isInQuoteList) return;
    onAddToQuote?.(product);
    setJustAddedId(product.id);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAddedId(null), ADDED_FEEDBACK_MS);
  };

  // En 1, el botón de restar es "quitar" (con confirmación)
  const handleDecrease = () => {
    if (!product) return;
    if (quoteQty <= 1) setConfirmRemoveOpen(true);
    else onUpdateQuoteQuantity?.(product.id, quoteQty - 1);
  };

  const handleIncrease = () => {
    if (!product || quoteQty >= MAX_QTY) return;
    onUpdateQuoteQuantity?.(product.id, quoteQty + 1);
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

  const trustItems: { icon: LucideIcon; text: string }[] = [
    { icon: ShieldCheck, text: 'Equipamiento profesional de alta performance' },
    { icon: Settings,    text: 'Diseñado para uso intensivo y continuo' },
    { icon: Award,       text: 'Materiales de alta calidad y máxima durabilidad' },
  ];

  // Pestañas tipo "segmented control": la píldora blanca que marca la activa
  // es un ::before anclado (CSS anchor positioning) que se desliza entre
  // pestañas — ver .modal-tabs en index.css.
  const tabTriggerCls = 'modal-tab';

  // Venta a medida: panel destacado que reemplaza las specs técnicas.
  const comentarioPanel = (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-6 lg:p-7">
      <div className="flex items-center gap-3 mb-3">
        <span aria-hidden="true" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-200 flex-shrink-0">
          <MessageSquare className="w-[1.125rem] h-[1.125rem] text-brand" />
        </span>
        <p className="text-[0.7188rem] font-bold uppercase tracking-[0.14em] text-brand">Importante</p>
      </div>
      <p className="text-[0.875rem] text-ink-700 leading-relaxed whitespace-pre-line text-pretty">
        {renderConNegrita(comentarioMedida || 'Consultar por especificaciones')}
      </p>
    </div>
  );

  const emptyNote = (text: string) => (
    <p className="rounded-2xl border border-dashed border-ink-300 bg-ink-50/60 px-5 py-9 text-center text-[0.8438rem] italic text-ink-500">{text}</p>
  );

  const specsPanel = needsSelection ? (
    emptyNote('Elegí una variante para ver sus especificaciones.')
  ) : esAMedida ? (
    comentarioPanel
  ) : hasSpecs ? (
    <dl className="rounded-2xl border border-ink-200 overflow-hidden bg-white divide-y divide-ink-150">
      {specs.map(s => (
        <div key={s.label} className="flex items-center justify-between gap-3 px-5 py-3.5 odd:bg-ink-50/50">
          <dt className="flex items-center gap-3 min-w-0 text-[0.8438rem] text-ink-600 font-medium">
            <span aria-hidden="true" className="spec-icon">
              <s.icon className="w-4 h-4" />
            </span>
            <span className="truncate">{s.label}</span>
          </dt>
          <dd className="font-semibold text-ink-900 text-right flex-shrink-0 text-[0.875rem]">{s.value}</dd>
        </div>
      ))}
    </dl>
  ) : (
    emptyNote('Consultar por especificaciones')
  );

  const caractPanel = hasCaract ? (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 rounded-2xl border border-ink-200 bg-white p-5">
      {caracteristicas.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5 text-ink-700 leading-snug text-[0.875rem]">
          <span aria-hidden="true" className="w-[1.125rem] h-[1.125rem] rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 mt-[1px]">
            <Check className="w-2.5 h-2.5 text-brand" strokeWidth={3} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  ) : (
    emptyNote('Consultar por características')
  );

  const accesorios = product?.accesorios_incluidos ?? [];
  const accesoriosPanel = showAccesoriosTab && (
    <div className="space-y-4">
      {hasAccesorios && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 rounded-2xl border border-ink-200 bg-white p-5">
          {accesorios.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5 text-ink-700 leading-snug text-[0.875rem]">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 mt-[0.4375rem]" />
              {a}
            </li>
          ))}
        </ul>
      )}
      {aclaracion && (
        <p className="text-[0.8438rem] text-ink-600 italic leading-relaxed rounded-2xl border border-ink-200 bg-ink-50 p-4 text-pretty">
          {aclaracion}
        </p>
      )}
    </div>
  );

  const variantesPanel = (
    <div>
      <p className="mb-3 text-[0.8125rem] text-ink-500">
        {needsSelection
          ? 'Elegí una variante para ver stock y especificaciones.'
          : `${allVariants.length} variantes disponibles.`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3" role="group" aria-label="Variantes">
        {allVariants.map(v => {
          const active = v.id === product?.id;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              onClick={() => handleSelectVariant(v.id)}
              className={`variant-card ${active ? 'variant-card--active' : ''}`}
            >
              <span className="flex items-start justify-between gap-2 mb-2.5">
                <span className={`text-[0.875rem] font-bold leading-snug ${active ? 'text-brand' : 'text-ink-900'}`}>
                  {variantLabel(v)}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                    active ? 'bg-brand border-brand' : 'border-ink-300'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[0.7188rem] font-mono text-ink-500 truncate">{v.codigo}</span>
                <span className="flex flex-shrink-0 items-center gap-1.5">
                  {(quoteQuantities[v.id] ?? 0) > 0 && <ListedTag quantity={quoteQuantities[v.id]} compact />}
                  <AvailabilityBadge modo={disponibilidadDeStock(v.stock)} size="sm" />
                </span>
              </span>
              {v.mostrar_precio && v.precio_usd != null && (
                <span className={`block text-[0.875rem] mt-2.5 pt-2.5 border-t font-bold ${active ? 'border-brand-200 text-brand' : 'border-ink-150 text-ink-900'}`}>
                  US$ {Number(v.precio_usd).toLocaleString('es-AR')}
                </span>
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
              {/* Fondo */}
              <motion.div
                className="fixed inset-0 z-[80] bg-ink-950/60 backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={onClose}
              />

              <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 lg:p-6 pointer-events-none">
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className="product-modal relative flex flex-col w-full h-[100dvh] bg-white pointer-events-auto lg:h-[min(86dvh,800px)] lg:w-[min(92vw,1180px)] lg:rounded-3xl lg:overflow-hidden"
                  initial={{ opacity: 0, scale: 0.94, y: 28 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10, transition: { duration: 0.2, ease: [0.5, 0, 0.75, 0] } }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.3 } }}
                >
                  {/* Cerrar */}
                  <button
                    type="button"
                    data-autofocus
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-3 right-3 z-30 flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full lg:rounded-xl border border-ink-200 bg-white/95 text-ink-600 shadow-[var(--shadow-sm)] transition-colors hover:border-brand/30 hover:bg-brand-50 hover:text-brand cursor-pointer lg:top-5 lg:right-5"
                  >
                    <X className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
                  </button>

                  <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[44%_56%]">

                    {/* Foto (desktop) */}
                    <div className="modal-media relative hidden min-h-0 flex-col lg:flex border-r border-ink-150">
                      <div className="relative min-h-0 flex-1">
                        <img
                          src="/images/logo/Logo.png"
                          alt=""
                          width={480}
                          height={333}
                          className="absolute top-6 left-6 z-[1] h-8 w-auto object-contain opacity-90"
                        />
                        {!imageLoaded && <div className="absolute inset-12 rounded-2xl skeleton" />}
                        <motion.img
                          src={imageUrl}
                          alt={familyRef.familia_nombre}
                          width={420}
                          height={494}
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-contain p-10"
                          initial={{ opacity: 0, scale: 1.03 }}
                          animate={imageLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.03 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          onLoad={() => setImageLoaded(true)}
                        />
                      </div>
                      <ul className="grid grid-cols-3 border-t border-ink-150 bg-white/70">
                        {trustItems.map(({ icon: Icon, text }, i) => (
                          <li key={text} className={`flex flex-col items-center gap-2 px-4 py-5 text-center ${i > 0 ? 'border-l border-ink-150' : ''}`}>
                            <span aria-hidden="true" className="spec-icon spec-icon--lg">
                              <Icon className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.9} />
                            </span>
                            <span className="text-[0.6875rem] leading-snug text-ink-600 font-medium text-balance">{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Datos */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div
                        ref={scrollRef}
                        data-lenis-prevent
                        className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
                        style={{ touchAction: 'pan-y' }}
                      >
                        {/* Foto (mobile) */}
                        <div className="modal-media relative aspect-[4/3] max-h-[40svh] w-full border-b border-ink-150 lg:hidden">
                          {!imageLoaded && <div className="absolute inset-8 rounded-2xl skeleton" />}
                          <CloudinaryImage
                            src={familyRef.familia_cloudinary_url}
                            alt={familyRef.familia_nombre}
                            width={480}
                            height={360}
                            sizes="100vw"
                            className={`absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            placeholderClass="absolute inset-0 h-full w-full object-contain p-10"
                            onLoad={() => setImageLoaded(true)}
                          />
                        </div>

                        <header className="px-5 pt-6 lg:px-9 lg:pt-10">
                          <p className="modal-eyebrow pr-12">{familyRef.familia_categoria}</p>
                          <h2 id={titleId} className="modal-product-header-title pr-10 lg:pr-12">{familyRef.familia_nombre}</h2>
                          {/* Variante y datos ocupan su lugar desde que se abre la ficha:
                              al elegir una variante el texto cambia en el lugar (solo un
                              fundido), sin empujar las pestañas hacia abajo. */}
                          {hasVariants && (
                            <p className="modal-product-subtitle truncate">
                              {product ? (
                                <span key={product.id} className="modal-swap">{variantLabel(product)}</span>
                              ) : (
                                <span className="text-ink-500">{allVariants.length} variantes disponibles</span>
                              )}
                            </p>
                          )}
                          <div className="modal-meta">
                            <span className="modal-meta__item">
                              <span className="modal-meta__label">Código</span>
                              {product ? (
                                <span key={product.id} className="modal-meta__value font-mono modal-swap">{product.codigo}</span>
                              ) : (
                                <span className="modal-meta__value text-ink-400" aria-label="Sin variante elegida">—</span>
                              )}
                            </span>
                            {product && (
                              <span key={`stock-${product.id}`} className="modal-meta__item modal-swap">
                                <AvailabilityBadge modo={disponibilidadDeStock(product.stock)} variant="inline" />
                              </span>
                            )}
                          </div>
                        </header>

                        <div className="px-5 pb-8 lg:px-9">
                          <Tabs value={effectiveTab} onValueChange={handleTabChange} className="gap-0">
                            <div className="sticky top-0 z-20 -mx-5 bg-white px-5 pt-3 lg:-mx-9 lg:px-9">
                              <TabsList ref={tabsListRef} className="modal-tabs flex w-full h-auto justify-start rounded-none bg-transparent p-0">
                                {hasVariants && <TabsTrigger value="variantes" className={tabTriggerCls}>Variantes</TabsTrigger>}
                                <TabsTrigger value="specs" className={tabTriggerCls}>{esAMedida ? 'Comentario' : 'Especificaciones'}</TabsTrigger>
                                <TabsTrigger value="caract" className={tabTriggerCls}>Características</TabsTrigger>
                                {showAccesoriosTab && <TabsTrigger value="accesorios" className={tabTriggerCls}>Accesorios</TabsTrigger>}
                              </TabsList>
                            </div>

                            {hasVariants && <TabsContent value="variantes" className="mt-0 pt-5 modal-tab-panel">{variantesPanel}</TabsContent>}
                            <TabsContent value="specs" className="mt-0 pt-5 modal-tab-panel">{specsPanel}</TabsContent>
                            <TabsContent value="caract" className="mt-0 pt-5 modal-tab-panel">{caractPanel}</TabsContent>
                            {showAccesoriosTab && <TabsContent value="accesorios" className="mt-0 pt-5 modal-tab-panel">{accesoriosPanel}</TabsContent>}
                          </Tabs>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex-shrink-0 border-t border-ink-200 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-9 lg:py-5">
                        {needsSelection && (
                          <p role="status" className="mb-3 text-center text-[0.7812rem] font-semibold text-brand">
                            Elegí una variante para continuar
                          </p>
                        )}
                        <div className="flex gap-2.5 lg:gap-3">
                          {product ? (
                            <a
                              href={getProductWhatsAppURL(product.nombre, product.codigo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Consultar ${product.nombre} por WhatsApp`}
                              className="btn btn-whatsapp-outline flex-1 lg:min-h-[3.25rem] lg:text-[0.9375rem]"
                            >
                              <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                              <span>Consultar<span className="hidden sm:inline"> por WhatsApp</span></span>
                            </a>
                          ) : (
                            <button type="button" disabled className="btn btn-whatsapp-outline flex-1 lg:min-h-[3.25rem] lg:text-[0.9375rem]">
                              <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                              <span>Consultar<span className="hidden sm:inline"> por WhatsApp</span></span>
                            </button>
                          )}
                          {/* Un solo lugar para los tres estados: se reemplazan sin mover nada */}
                          <div className="relative flex flex-1 min-w-0">
                            <AnimatePresence mode="popLayout" initial={false}>
                              {showAdded ? (
                                <motion.div
                                  key="added"
                                  role="status"
                                  className="btn btn-added w-full lg:min-h-[3.25rem] lg:text-[0.9375rem]"
                                  initial={{ opacity: 0, scale: 0.94 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.97 }}
                                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <motion.path
                                      d="M5 12.5l4.5 4.5L19 7.5"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                                    />
                                  </svg>
                                  Agregado a tu lista
                                </motion.div>
                              ) : isInQuoteList && product ? (
                                <motion.div
                                  key="qty"
                                  role="group"
                                  aria-label={`Cantidad de ${product.nombre} en tu lista`}
                                  className="qty-stepper lg:min-h-[3.25rem]"
                                  initial={{ opacity: 0, scale: 0.97 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.97 }}
                                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  <button
                                    type="button"
                                    onClick={handleDecrease}
                                    className={`qty-stepper__btn ${quoteQty <= 1 ? 'qty-stepper__btn--remove' : ''}`}
                                    aria-label={quoteQty <= 1 ? 'Quitar de la lista' : 'Restar una unidad'}
                                  >
                                    {quoteQty <= 1
                                      ? <Trash2 className="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
                                      : <Minus className="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />}
                                  </button>
                                  <span className="qty-stepper__value" aria-live="polite">
                                    <strong key={quoteQty} className="modal-swap">{quoteQty}</strong>
                                    <span>en tu lista</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleIncrease}
                                    disabled={quoteQty >= MAX_QTY}
                                    className="qty-stepper__btn"
                                    aria-label="Sumar una unidad"
                                  >
                                    <Plus className="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="add"
                                  type="button"
                                  className="btn btn-primary w-full lg:min-h-[3.25rem] lg:text-[0.9375rem]"
                                  onClick={handleAdd}
                                  disabled={needsSelection}
                                  initial={{ opacity: 0, scale: 0.97 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.97 }}
                                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  <Plus className="w-4 h-4" aria-hidden="true" /> Agregar a lista
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
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
