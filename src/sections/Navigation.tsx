import type { ComponentType } from 'react';
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  ChevronDown,
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  Package,
  ArrowRight,
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, Warehouse, ConciergeBell,
} from 'lucide-react';
import { categories, type Product } from '@/data/products';
import { companyConfig } from '@/data/company';
import { buildQuoteMessage, getWhatsAppURL } from '@/lib/whatsapp';
import { handleAnchorClick } from '@/lib/scroll';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { QuoteItem } from '@/hooks/useQuoteList';

interface NavigationProps {
  onCategorySelect?: (categoryId: string) => void;
  quoteItems?: QuoteItem[];
  onRemoveFromQuote?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onUpdateNotes?: (productId: string, notes: string) => void;
  onClearQuote?: () => void;
  totalQuoteItems?: number;
  onProductClick?: (product: Product) => void;
}

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  ChefHat, Utensils, Store, Settings2, Zap, Flame,
  Droplets, Table2, Grid3X3, Snowflake, Layers, Warehouse, ConciergeBell,
};

const NAV_LINKS = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Productos', href: '#catalogo', hasDropdown: true },
  { name: 'Nosotros', href: '#nosotros' },
  { name: 'Envíos', href: '#envios-postventa' },
  { name: 'Contacto', href: '#contacto' },
];

type ConfirmState = { kind: 'remove'; item: QuoteItem } | { kind: 'clear' } | null;

function pluralProductos(n: number): string {
  return `${n} ${n === 1 ? 'producto' : 'productos'}`;
}

export function Navigation({
  onCategorySelect,
  quoteItems = [],
  onRemoveFromQuote,
  onUpdateQuantity,
  onUpdateNotes,
  onClearQuote,
  totalQuoteItems = 0,
  onProductClick,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const productsTriggerRef = useRef<HTMLButtonElement>(null);
  const productsItemRef = useRef<HTMLDivElement>(null);
  const hoverPreview = useRef(false);
  const dropdownId = useId();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(prev => (prev ? y > 10 : y > 50));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Barra de estado del navegador acompaña el color de la navbar
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isScrolled ? '#FAFAF8' : '#000000');
  }, [isScrolled]);

  // Dropdown "Productos": Escape lo cierra y devuelve el foco al botón.
  useEffect(() => {
    if (!isProductsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsProductsOpen(false);
      productsTriggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isProductsOpen]);

  // Si se agranda la ventana con el menú móvil abierto, se cierra (no existe en desktop).
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => { if (media.matches) setIsMobileMenuOpen(false); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [isMobileMenuOpen]);

  const closeMobile = () => setIsMobileMenuOpen(false);

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const quoteHref = getWhatsAppURL(
    buildQuoteMessage(quoteItems.map(i => ({
      nombre: i.product.nombre,
      codigo: i.product.codigo,
      quantity: i.quantity,
      notes: i.notes,
    })))
  );

  const closeConfirm = () => setConfirm(null);

  const quoteLabel = totalQuoteItems > 0
    ? `Mi lista de cotización, ${pluralProductos(totalQuoteItems)}`
    : 'Mi lista de cotización';

  const linkTone = isScrolled
    ? 'text-[#6B6159] hover:text-[#1A1613] hover:bg-[#F4F0E8]'
    : 'text-white/85 hover:text-white hover:bg-white/10';

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header data-site-header data-dark-surface={isScrolled ? undefined : true} className="fixed top-0 left-0 right-0 z-[45]">
        <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            animate={isScrolled ? {
              backgroundColor: 'rgba(250,250,248,1)',
              boxShadow: '0 1px 0 rgba(196,27,46,0.15), 0 6px 32px rgba(26,22,19,0.08)',
              borderColor: 'rgba(196,27,46,0.18)',
            } : {
              backgroundColor: 'rgba(0,0,0,0)',
              boxShadow: '0 0 0 rgba(0,0,0,0)',
              borderColor: 'rgba(196,27,46,0)',
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className={`relative border-b lg:border transition-[border-radius,padding] duration-700 ease-in-out ${
              isScrolled
                ? 'lg:rounded-b-2xl lg:py-3 lg:px-10 xl:px-14'
                : 'lg:rounded-none py-0 lg:py-5'
            }`}
          >
            {!isScrolled && (
              <div className="lg:hidden absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            )}
            <div className="relative flex items-center h-16 lg:h-auto">

              {/* Logo */}
              <a
                href="#inicio"
                onClick={handleAnchorClick}
                aria-label={`${companyConfig.name} Argentina — inicio`}
                className="flex items-center flex-shrink-0 ml-3 sm:ml-0 rounded-md"
              >
                <img
                  src="/images/logo/Logo.png"
                  alt=""
                  width={480}
                  height={333}
                  className={`transition-all duration-300 w-auto ${
                    isScrolled ? 'h-9 lg:h-9' : 'h-10 lg:h-12 brightness-0 invert'
                  }`}
                />
              </a>

              {/* Desktop links */}
              <nav aria-label="Principal" className="hidden lg:block absolute left-1/2 -translate-x-1/2">
                <ul className="flex items-center gap-0.5">
                  {NAV_LINKS.map((link) =>
                    link.hasDropdown ? (
                      <li key={link.name}>
                        <div
                          ref={productsItemRef}
                          className="relative"
                          onPointerEnter={(e) => {
                            if (e.pointerType === 'touch' || isProductsOpen) return;
                            hoverPreview.current = true;
                            setIsProductsOpen(true);
                          }}
                          onPointerLeave={(e) => {
                            if (e.pointerType === 'touch' || !hoverPreview.current) return;
                            hoverPreview.current = false;
                            setIsProductsOpen(false);
                          }}
                          onBlur={(e) => {
                            const next = e.relatedTarget as Node | null;
                            if (next && !productsItemRef.current?.contains(next)) setIsProductsOpen(false);
                          }}
                        >
                          <button
                            ref={productsTriggerRef}
                            type="button"
                            aria-expanded={isProductsOpen}
                            aria-controls={dropdownId}
                            onClick={() => {
                              // Si estaba abierto solo por hover, el click lo fija en vez de cerrarlo.
                              if (hoverPreview.current) { hoverPreview.current = false; return; }
                              setIsProductsOpen(o => !o);
                            }}
                            className={`flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors duration-150 cursor-pointer ${linkTone}`}
                          >
                            {link.name}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                          </button>

                          <AnimatePresence>
                            {isProductsOpen && (
                              <motion.div
                                id={dropdownId}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="absolute top-full -left-8 z-50 pt-3"
                              >
                                <div className={`w-[480px] max-w-[calc(100dvw_-_2rem)] bg-white border border-[#EBE5DC] shadow-xl shadow-[rgba(26,22,19,0.1)] py-2 overflow-hidden ${isScrolled ? 'rounded-b-2xl rounded-t-none' : 'rounded-2xl'}`}>
                                  <a
                                    href="#catalogo"
                                    onClick={(e) => handleAnchorClick(e, () => setIsProductsOpen(false))}
                                    className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#C41B2E] hover:bg-[#FFF0F1] transition-colors flex items-center gap-2"
                                  >
                                    <Package className="w-4 h-4" aria-hidden="true" />
                                    Ver todos los productos
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />
                                  </a>
                                  <div className="h-px bg-[#EBE5DC] mx-4 my-1" />
                                  <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-4 py-3" aria-label="Categorías">
                                    {categories.map((cat) => {
                                      const Icon = CATEGORY_ICONS[cat.icon];
                                      return (
                                        <li key={cat.id}>
                                          <button
                                            type="button"
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#6B6159] hover:bg-[#F4F0E8] hover:text-[#1A1613] transition-colors cursor-pointer"
                                          >
                                            {Icon && <Icon className="w-[18px] h-[18px] text-[#C41B2E] flex-shrink-0" />}
                                            <span className="truncate">{cat.name}</span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </li>
                    ) : (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          onClick={handleAnchorClick}
                          className={`block text-sm font-medium px-3.5 py-2 rounded-lg transition-colors duration-150 ${linkTone}`}
                        >
                          {link.name}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  aria-label={quoteLabel}
                  className={`hidden lg:flex relative items-center gap-2 px-3.5 py-2 rounded-xl transition-colors duration-150 cursor-pointer border ${
                    isScrolled
                      ? 'bg-[#F4F0E8] hover:bg-[#EBE5DC] text-[#6B6159] border-[#EBE5DC]'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/15'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Mi lista</span>
                  {totalQuoteItems > 0 && (
                    <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#C41B2E] text-white text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                      {totalQuoteItems}
                    </span>
                  )}
                </button>

                <a
                  href="#catalogo"
                  onClick={handleAnchorClick}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 bg-[#C41B2E] text-white hover:bg-[#B51426] shadow-[0_2px_12px_rgba(196,27,46,0.25)]"
                >
                  <Package className="w-4 h-4" aria-hidden="true" />
                  Catálogo
                </a>

                {/* Mobile */}
                <div className="lg:hidden flex items-center gap-0.5">
                  {totalQuoteItems > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsQuoteOpen(true)}
                      className={`relative flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                        isScrolled
                          ? 'w-11 h-11 text-[#6B6159] hover:bg-[#F4F0E8]'
                          : 'w-12 h-12 text-white hover:bg-white/10'
                      }`}
                      aria-label={quoteLabel}
                    >
                      <ClipboardList className={isScrolled ? 'w-5 h-5' : 'w-6 h-6'} aria-hidden="true" />
                      <span aria-hidden="true" className="absolute top-2 right-2 min-w-[17px] h-[17px] px-1 bg-[#C41B2E] text-white text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                        {totalQuoteItems}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-expanded={isMobileMenuOpen}
                    aria-haspopup="dialog"
                    className={`flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      isScrolled
                        ? 'w-11 h-11 text-[#1A1613] hover:bg-[#F4F0E8]'
                        : 'w-12 h-12 text-white hover:bg-white/10'
                    }`}
                    aria-label="Abrir menú"
                  >
                    <Menu className={isScrolled ? 'w-6 h-6' : 'w-7 h-7'} aria-hidden="true" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Quote Sheet ─────────────────────────────────────────── */}
      <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden bg-white border-[#EBE5DC]"
          // El ConfirmDialog vive adentro del Sheet: su Escape y sus clicks no deben cerrar la lista.
          onEscapeKeyDown={(e) => { if (confirm) e.preventDefault(); }}
          onInteractOutside={(e) => { if (confirm) e.preventDefault(); }}
        >
          <SheetHeader className="px-5 py-4 pr-14 border-b border-[#EBE5DC] flex-shrink-0">
            <SheetTitle className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-[#C41B2E]" aria-hidden="true" />
              <span className="font-semibold text-[#1A1613] tracking-tight text-base">Mi lista</span>
              {totalQuoteItems > 0 && (
                <span className="ml-auto text-[11px] font-medium text-[#6B6159] bg-[#F4F0E8] px-2.5 py-1 rounded-sm border border-[#EBE5DC] tabular-nums">
                  {pluralProductos(totalQuoteItems)}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Productos agregados a tu lista de cotización. Se guardan en este dispositivo.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5" data-lenis-prevent>
            {quoteItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-14 h-14 border border-[#EBE5DC] rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
                  <ClipboardList className="w-6 h-6 text-[#7B7064]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1613] mb-1">Lista vacía</p>
                <p className="text-xs text-[#6B6159] max-w-[220px] leading-relaxed text-pretty">
                  Explorá el catálogo y agregá productos para cotizar juntos.
                </p>
                <a
                  href="#catalogo"
                  onClick={(e) => handleAnchorClick(e, () => setIsQuoteOpen(false))}
                  className="mt-5 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#C41B2E] text-white text-[13px] font-semibold hover:bg-[#B51426]"
                >
                  <Package className="w-4 h-4" aria-hidden="true" />
                  Ver catálogo
                </a>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {quoteItems.map((item) => {
                  const notesId = `quote-notes-${item.product.id}`;
                  const expanded = expandedItem === item.product.id;
                  return (
                    <li
                      key={item.product.id}
                      className="quote-item relative border border-[#EBE5DC] rounded-2xl overflow-hidden bg-[#FAF8F4] transition-[border-color,box-shadow] duration-150"
                    >
                      <div className="flex gap-3 p-3">
                        <CloudinaryImage
                          src={item.product.cloudinary_url ?? item.product.familia_cloudinary_url}
                          alt=""
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-[#EBE5DC]"
                          placeholderClass="w-14 h-14 object-contain p-1.5 rounded-xl flex-shrink-0 bg-[#EBE5DC]"
                          sizes="56px"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="product-card-category !mb-0.5">{item.product.categoria}</p>
                          <h3 className="text-[13.5px] font-semibold text-[#1A1613] leading-snug line-clamp-2 font-sans">
                            <button
                              type="button"
                              onClick={() => { onProductClick?.(item.product); setIsQuoteOpen(false); }}
                              className="quote-item__link text-left cursor-pointer hover:text-[#C41B2E]"
                            >
                              {item.product.nombre}
                            </button>
                          </h3>
                          <p className="text-[11px] font-mono text-[#6B6159] mt-0.5">#{item.product.codigo}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirm({ kind: 'remove', item })}
                          aria-label={`Quitar ${item.product.nombre} de la lista`}
                          className="w-8 h-8 -mr-1 -mt-1 flex items-center justify-center rounded-lg text-[#7B7064] hover:text-[#C41B2E] hover:bg-[#FFF0F1] transition-colors cursor-pointer flex-shrink-0 self-start"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 px-3 pb-3 border-t border-[#EBE5DC] pt-2.5">
                        <div className="flex items-center border border-[#EBE5DC] rounded-lg overflow-hidden bg-white" role="group" aria-label={`Cantidad de ${item.product.nombre}`}>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Restar uno"
                            className="w-8 h-8 flex items-center justify-center text-[#6B6159] hover:bg-[#F4F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <output className="w-9 text-center text-xs font-semibold text-[#1A1613] border-x border-[#EBE5DC] tabular-nums" aria-live="polite">
                            {item.quantity}
                          </output>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
                            aria-label="Sumar uno"
                            className="w-8 h-8 flex items-center justify-center text-[#6B6159] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedItem(expanded ? null : item.product.id)}
                          aria-expanded={expanded}
                          aria-controls={notesId}
                          className="text-[12px] font-medium text-[#6B6159] hover:text-[#C41B2E] transition-colors cursor-pointer flex items-center gap-1 min-h-8"
                        >
                          {expanded
                            ? <><ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> Ocultar nota</>
                            : <><ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /> {item.notes ? 'Editar nota' : 'Añadir nota'}</>}
                        </button>
                      </div>

                      {expanded && (
                        <div id={notesId} className="px-3 pb-3">
                          <label htmlFor={`${notesId}-field`} className="sr-only">Nota para {item.product.nombre}</label>
                          <Textarea
                            id={`${notesId}-field`}
                            placeholder="Especificaciones, consultas..."
                            value={item.notes}
                            maxLength={500}
                            onChange={(e) => onUpdateNotes?.(item.product.id, e.target.value)}
                            className="text-base sm:text-xs resize-none rounded-lg border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#7B7064] focus:border-[#C41B2E]"
                            rows={2}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {quoteItems.length > 0 && (
            <div className="px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#EBE5DC] flex-shrink-0 space-y-2 bg-white">
              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsQuoteOpen(false)}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl transition-colors bg-[#25D366] hover:bg-[#1EAF56] shadow-[0_2px_16px_rgba(37,211,102,0.2)]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Enviar lista por WhatsApp
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: 'clear' })}
                  className="flex-1 h-10 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#6B6159] hover:text-[#C41B2E] border border-[#EBE5DC] rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Vaciar
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(false)}
                  className="flex-1 h-10 text-[12px] font-medium text-[#6B6159] hover:text-[#1A1613] border border-[#EBE5DC] rounded-xl transition-colors cursor-pointer"
                >
                  Seguir viendo
                </button>
              </div>
            </div>
          )}

          <ConfirmDialog
            portal={false}
            isOpen={confirm !== null}
            title={confirm?.kind === 'remove'
              ? `¿Quitar "${confirm.item.product.nombre}" de tu lista?`
              : '¿Vaciar toda la lista?'}
            description={confirm?.kind === 'remove'
              ? 'Vas a sacarlo de tu lista de cotización, pero podés volver a agregarlo cuando quieras.'
              : `Se quitan los ${pluralProductos(quoteItems.length)} de tu lista de cotización.`}
            confirmLabel={confirm?.kind === 'clear' ? 'Vaciar' : 'Quitar'}
            cancelLabel="Cancelar"
            onConfirm={() => {
              if (confirm?.kind === 'remove') onRemoveFromQuote?.(confirm.item.product.id);
              if (confirm?.kind === 'clear') onClearQuote?.();
              closeConfirm();
            }}
            onCancel={closeConfirm}
          />
        </SheetContent>
      </Sheet>

      {/* ── Mobile menu (Radix Sheet: foco atrapado, Escape, fondo inerte) ── */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="lg:hidden w-[min(22rem,88dvw)] max-w-none sm:max-w-none p-0 flex flex-col gap-0 bg-white border-l border-[#EBE5DC] [&>button:first-child]:top-4 [&>button:first-child]:right-4 [&>button:first-child]:w-9 [&>button:first-child]:h-9 [&>button:first-child]:flex [&>button:first-child]:items-center [&>button:first-child]:justify-center [&>button:first-child]:rounded-lg [&>button:first-child]:opacity-100 [&>button:first-child]:text-[#6B6159] [&>button:first-child:hover]:bg-[#F4F0E8] [&>button:first-child_svg]:w-5 [&>button:first-child_svg]:h-5"
        >
          <SheetHeader className="flex-row items-center h-16 px-5 border-b border-[#EBE5DC] space-y-0 flex-shrink-0">
            <SheetTitle>
              <img
                src="/images/logo/Logo.png"
                alt={`${companyConfig.name} — menú`}
                width={480}
                height={333}
                loading="lazy"
                className="h-7 w-auto"
              />
            </SheetTitle>
            <SheetDescription className="sr-only">Navegación del sitio</SheetDescription>
          </SheetHeader>

          <nav aria-label="Menú móvil" className="p-5 flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <button
              type="button"
              onClick={() => { closeMobile(); setIsQuoteOpen(true); }}
              className="flex items-center gap-3 w-full p-3.5 bg-[#FAF8F4] hover:bg-[#F4F0E8] rounded-xl mb-5 transition-colors cursor-pointer border border-[#EBE5DC] text-left"
            >
              <span className="relative w-9 h-9 border border-[#EBE5DC] rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <ClipboardList className="w-4 h-4 text-[#C41B2E]" />
                {totalQuoteItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#C41B2E] text-white text-[9px] font-black rounded-full flex items-center justify-center tabular-nums">
                    {totalQuoteItems}
                  </span>
                )}
              </span>
              <span>
                <span className="block font-semibold text-[#1A1613] text-sm">Mi lista de cotización</span>
                <span className="block text-[12px] text-[#6B6159] mt-0.5">
                  {totalQuoteItems > 0 ? pluralProductos(totalQuoteItems) : 'Sin productos aún'}
                </span>
              </span>
            </button>

            <ul className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, closeMobile)}
                    className="flex items-center w-full text-base font-medium text-[#1A1613] px-3 py-3 rounded-lg hover:bg-[#F4F0E8] hover:text-[#C41B2E] transition-colors"
                  >
                    {link.name}
                  </a>
                  {link.hasDropdown && (
                    <ul className="grid grid-cols-2 gap-0.5 pl-3 pb-2" aria-label="Categorías">
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(cat.id)}
                            className="block w-full text-left text-sm text-[#6B6159] px-3 py-2.5 rounded-lg hover:text-[#C41B2E] hover:bg-[rgba(196,27,46,0.06)] transition-colors cursor-pointer truncate"
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5 border-t border-[#EBE5DC]">
              <a
                href={getWhatsAppURL()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl bg-[#25D366] hover:bg-[#1EAF56] shadow-[0_2px_12px_rgba(37,211,102,0.25)]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Cotizar por WhatsApp
              </a>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
