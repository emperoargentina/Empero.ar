import type { ComponentType } from 'react';
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Menu,
  ChevronDown,
  ClipboardList,
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
  SheetTrigger,
} from '@/components/ui/sheet';
import { QuoteListPanel } from '@/components/quote/QuoteListPanel';
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

const mobileMenuItem: Variants = {
  hidden: { opacity: 0, y: 7 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.075 + index * 0.027, duration: 0.22, ease: 'easeOut' },
  }),
};

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
  const reduceMotion = useReducedMotion();
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

  const quoteLabel = totalQuoteItems > 0
    ? `Mi lista de cotización, ${pluralProductos(totalQuoteItems)}`
    : 'Mi lista de cotización';

  const linkTone = isScrolled
    ? 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
    : 'text-white/85 hover:text-white hover:bg-white/10';

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header data-site-header data-dark-surface={isScrolled ? undefined : true} className="fixed top-0 left-0 right-0 z-[45]">
        <div className="w-full max-w-[100rem] mx-auto px-0 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            animate={isScrolled ? {
              backgroundColor: 'rgba(250,250,248,0.94)',
              boxShadow: '0 1px 0 rgba(195,21,27,0.14), 0 10px 32px -12px rgba(26,22,19,0.16)',
              borderColor: 'rgba(195,21,27,0.16)',
            } : {
              backgroundColor: 'rgba(250,250,248,0)',
              boxShadow: '0 0 0 rgba(0,0,0,0)',
              borderColor: 'rgba(195,21,27,0)',
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={`nav-bar relative border-b lg:border transition-[border-radius,padding] duration-500 ease-in-out ${
              isScrolled
                ? 'is-scrolled lg:rounded-b-2xl lg:py-2.5 px-3 sm:px-0 lg:px-8 xl:px-12'
                : 'px-3 sm:px-0 lg:rounded-none lg:py-3.5'
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
                className="flex items-center flex-shrink-0 rounded-md"
              >
                <img
                  src="/images/logo/Logo.png"
                  alt=""
                  width={480}
                  height={333}
                  className={`transition-all duration-300 w-auto ${
                    isScrolled ? 'h-9 lg:h-9' : 'h-10 lg:h-10 brightness-0 invert'
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
                                <div className="w-[30rem] max-w-[calc(100dvw_-_2rem)] bg-white border border-ink-200 rounded-2xl py-2 overflow-hidden shadow-[var(--shadow-lg)]">
                                  <a
                                    href="#catalogo"
                                    onClick={(e) => handleAnchorClick(e, () => setIsProductsOpen(false))}
                                    className="w-full text-left px-5 py-3 text-sm font-semibold text-brand hover:bg-brand-50 transition-colors flex items-center gap-2"
                                  >
                                    <Package className="w-4 h-4" aria-hidden="true" />
                                    Ver todos los productos
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />
                                  </a>
                                  <div className="h-px bg-ink-200 mx-4 my-1" />
                                  <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-4 py-3" aria-label="Categorías">
                                    {categories.map((cat) => {
                                      const Icon = CATEGORY_ICONS[cat.icon];
                                      return (
                                        <li key={cat.id}>
                                          <button
                                            type="button"
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md text-[0.875rem] text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors cursor-pointer"
                                          >
                                            {Icon && <Icon className="w-[1.125rem] h-[1.125rem] text-brand flex-shrink-0" />}
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
                  className={`hidden lg:flex relative items-center gap-2 px-3.5 py-2 rounded-xl transition-colors duration-150 cursor-pointer border text-sm font-medium ${
                    isScrolled
                      ? 'bg-ink-100 hover:bg-ink-200 text-ink-700 border-ink-200'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/15'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" aria-hidden="true" />
                  Mi lista
                  {totalQuoteItems > 0 && (
                    <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-brand text-white text-[0.625rem] font-bold rounded-full flex items-center justify-center tabular-nums ring-2 ring-[var(--page-bg)]">
                      {totalQuoteItems}
                    </span>
                  )}
                </button>

                <a
                  href="#catalogo"
                  onClick={handleAnchorClick}
                  className="hidden lg:inline-flex btn btn-sm btn-primary"
                >
                  <Package className="w-4 h-4" aria-hidden="true" />
                  Catálogo
                </a>

                {/* Mobile */}
                <div className="lg:hidden flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setIsQuoteOpen(true)}
                    className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors cursor-pointer ${
                      isScrolled ? 'text-ink-700 hover:bg-ink-100' : 'text-white hover:bg-white/10'
                    }`}
                    aria-label={quoteLabel}
                    aria-haspopup="dialog"
                  >
                    <ClipboardList className="w-[1.375rem] h-[1.375rem]" aria-hidden="true" />
                    {totalQuoteItems > 0 && (
                      <span aria-hidden="true" className="absolute top-1.5 right-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-brand text-white text-[0.625rem] font-bold rounded-full flex items-center justify-center tabular-nums ring-2 ring-white/90">
                        {totalQuoteItems}
                      </span>
                    )}
                  </button>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors cursor-pointer ${
                        isScrolled ? 'text-ink-900 hover:bg-ink-100' : 'text-white hover:bg-white/10'
                      }`}
                      aria-label="Abrir menú"
                    >
                      <Menu className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </SheetTrigger>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Mi lista: hoja inferior en mobile, panel flotante en desktop ── */}
      <QuoteListPanel
        open={isQuoteOpen}
        onOpenChange={setIsQuoteOpen}
        items={quoteItems}
        whatsappHref={quoteHref}
        onRemove={onRemoveFromQuote}
        onUpdateQuantity={onUpdateQuantity}
        onUpdateNotes={onUpdateNotes}
        onClear={onClearQuote}
        onProductClick={onProductClick}
      />

      {/* ── Mobile menu (Radix Sheet: foco atrapado, Escape, fondo inerte) ── */}
      <SheetContent
        side="right"
        closeLabel="Cerrar menú"
        overlayClassName="bg-ink-950/45 duration-200 motion-reduce:animate-none"
        className="lg:hidden w-[min(22rem,88dvw)] max-w-none sm:max-w-none p-0 flex flex-col gap-0 bg-ink-50 border-l border-ink-200 data-[state=open]:duration-300 data-[state=closed]:duration-200 motion-reduce:!animate-none [&>button:first-child]:top-2.5 [&>button:first-child]:right-4 [&>button:first-child]:w-11 [&>button:first-child]:h-11 [&>button:first-child]:flex [&>button:first-child]:items-center [&>button:first-child]:justify-center [&>button:first-child]:rounded-xl [&>button:first-child]:opacity-100 [&>button:first-child]:text-ink-600 [&>button:first-child]:bg-transparent [&>button:first-child:hover]:bg-ink-100 [&>button:first-child_svg]:w-5 [&>button:first-child_svg]:h-5"
      >
        <SheetHeader className="flex-row items-center h-16 px-5 border-b border-ink-200 space-y-0 flex-shrink-0">
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

        <motion.nav
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
          aria-label="Menú móvil"
          className="p-5 flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          <motion.button
            variants={mobileMenuItem}
            custom={0}
            type="button"
            onClick={() => { closeMobile(); setIsQuoteOpen(true); }}
            className="flex items-center gap-3 w-full p-3.5 bg-white hover:bg-ink-100 rounded-xl mb-4 transition-colors cursor-pointer border border-ink-200 text-left"
          >
            <span className="relative w-9 h-9 border border-ink-200 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <ClipboardList className="w-4 h-4 text-brand" />
              {totalQuoteItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-brand text-white text-[0.5625rem] font-black rounded-full flex items-center justify-center tabular-nums">
                  {totalQuoteItems}
                </span>
              )}
            </span>
            <span>
              <span className="block font-semibold text-ink-900 text-sm">Mi lista de cotización</span>
              <span className="block text-[0.75rem] text-ink-600 mt-0.5">
                {totalQuoteItems > 0 ? pluralProductos(totalQuoteItems) : 'Sin productos aún'}
              </span>
            </span>
          </motion.button>

          <ul className="space-y-0.5">
            {NAV_LINKS.map((link, index) => (
              <motion.li key={link.name} variants={mobileMenuItem} custom={index + 1}>
                <a
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, closeMobile)}
                  className="group flex items-center justify-between gap-3 w-full text-base font-semibold text-ink-900 px-3 py-3 rounded-lg hover:bg-ink-100 hover:text-brand transition-colors"
                >
                  {link.name}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-ink-500 group-hover:text-brand" />
                </a>
                {link.hasDropdown && (
                  <ul className="mb-2 grid grid-cols-2 gap-1.5 rounded-2xl bg-ink-100/75 p-1.5" aria-label="Categorías de productos">
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.icon] ?? Package;

                      return (
                        <li key={cat.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(cat.id)}
                            className="group flex min-h-11 w-full cursor-pointer items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-1.5 py-1.5 text-left text-xs font-semibold leading-tight text-ink-800 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand min-[380px]:gap-2 min-[380px]:px-2"
                          >
                            <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-50 text-brand transition-colors group-hover:bg-brand-100">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 [overflow-wrap:anywhere]">{cat.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.li>
            ))}
          </ul>

          <motion.div variants={mobileMenuItem} custom={NAV_LINKS.length + 1} className="mt-auto pt-5 border-t border-ink-200">
            <a
              href={getWhatsAppURL()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="btn btn-lg btn-whatsapp w-full"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Cotizar por WhatsApp
            </a>
          </motion.div>
        </motion.nav>
      </SheetContent>
    </Sheet>
  );
}
