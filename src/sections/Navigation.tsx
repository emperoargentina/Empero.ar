import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  MessageCircle,
  ChevronDown,
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { categories } from '@/data/products';
import { whatsappConfig, companyConfig } from '@/data/company';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

interface QuoteItem {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    image: string;
  };
  quantity: number;
  notes: string;
}

interface NavigationProps {
  onCategorySelect?: (categoryId: string) => void;
  quoteItems?: QuoteItem[];
  onRemoveFromQuote?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onUpdateNotes?: (productId: string, notes: string) => void;
  onClearQuote?: () => void;
  totalQuoteItems?: number;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Lavado': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
  'Refrigeración': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=100&h=100&fit=crop',
  'Distribución y Autoservicio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop',
  'Hornos': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop',
  'Freidoras': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop',
  'Planchas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop',
  'Cocinas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop',
  'Parrillas': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop',
  'Cucipastas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
  'Hornos a Gas Bajo Mostrador': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop',
  'Superficies': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
  'Elaboración': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=100&h=100&fit=crop',
  'Mesas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
};

function getCategoryImage(category: string) {
  return CATEGORY_IMAGES[category] ?? 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop';
}

export function Navigation({
  onCategorySelect,
  quoteItems = [],
  onRemoveFromQuote,
  onUpdateQuantity,
  onUpdateNotes,
  onClearQuote,
  totalQuoteItems = 0,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(whatsappConfig.defaultMessage);
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`, '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    scrollToSection('catalogo');
    setIsMobileMenuOpen(false);
  };

  const handleSendQuote = () => {
    if (quoteItems.length === 0) return;
    let message = 'Hola, quiero cotizar los siguientes productos:\n\n';
    quoteItems.forEach((item, i) => {
      message += `${i + 1}. ${item.product.name} (SKU: ${item.product.sku}) - Cant: ${item.quantity}`;
      if (item.notes) message += ` - ${item.notes}`;
      message += '\n';
    });
    message += `\nTotal: ${totalQuoteItems} unidades\n\nQuedo atento. Gracias!`;
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setIsQuoteOpen(false);
  };

  const navLinks = [
    { name: 'Inicio', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { name: 'Productos', action: () => scrollToSection('catalogo'), hasDropdown: true },
    { name: 'Nosotros', action: () => scrollToSection('nosotros') },
    { name: 'Contacto', action: () => scrollToSection('contacto') },
  ];

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[60]">
        <div className={`transition-[padding] duration-500 ease-in-out ${isScrolled ? 'lg:px-3 lg:pt-3' : ''}`}>
          <motion.div
            animate={isScrolled ? {
              backgroundColor: 'rgba(250,250,248,0.97)',
              boxShadow: '0 1px 0 rgba(196,27,46,0.15), 0 4px 24px rgba(26,22,19,0.06)',
              borderColor: 'rgba(196,27,46,0.18)',
            } : {
              backgroundColor: 'rgba(0,0,0,0)',
              boxShadow: '0 0 0 rgba(0,0,0,0)',
              borderColor: 'rgba(196,27,46,0)',
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`border ${isScrolled ? 'backdrop-blur-md' : ''} ${
              isScrolled
                ? 'lg:max-w-[1280px] lg:mx-auto lg:rounded-2xl px-4 sm:px-6 py-3'
                : 'container-custom py-0 lg:py-5'
            }`}
          >
            {/* Fixed 64px height on mobile for perfect vertical rhythm */}
            <div className="flex items-center h-16 lg:h-auto">

              {/* Logo */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center flex-shrink-0"
              >
                <img
                  src="/images/logo/Logo.png"
                  alt={companyConfig.name}
                  className={`transition-all duration-300 w-auto ${
                    isScrolled ? 'h-9 lg:h-9' : 'h-10 lg:h-12 brightness-0 invert'
                  }`}
                />
              </a>

              {/* Desktop links */}
              <div className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
                {navLinks.map((link) =>
                  link.hasDropdown ? (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => setIsProductsOpen(true)}
                      onMouseLeave={() => setIsProductsOpen(false)}
                    >
                      <button
                        className={`flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                          isScrolled
                            ? 'text-[#6B6159] hover:text-[#1A1613] hover:bg-[#F4F0E8]'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => scrollToSection('catalogo')}
                      >
                        {link.name}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isProductsOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                          <div className="w-54 bg-white rounded-xl border border-[#EBE5DC] shadow-xl shadow-[rgba(26,22,19,0.08)] py-1.5 overflow-hidden">
                            <button
                              onClick={() => { scrollToSection('catalogo'); setIsProductsOpen(false); }}
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-[#1A1613] hover:bg-[#F4F0E8] transition-colors"
                            >
                              Ver todos los productos
                            </button>
                            <div className="h-px bg-[#EBE5DC] my-1 mx-3" />
                            <div className="max-h-64 overflow-y-auto">
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => { handleCategoryClick(cat.id); setIsProductsOpen(false); }}
                                  className="w-full text-left px-4 py-1.5 text-sm text-[#6B6159] hover:text-[#C41B2E] hover:bg-[rgba(196,27,46,0.06)] transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      key={link.name}
                      onClick={link.action}
                      className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                        isScrolled
                          ? 'text-[#6B6159] hover:text-[#1A1613] hover:bg-[#F4F0E8]'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.name}
                    </button>
                  )
                )}
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Quote button */}
                <button
                  onClick={() => setIsQuoteOpen(true)}
                  className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 cursor-pointer border ${
                    isScrolled
                      ? 'bg-[#F4F0E8] hover:bg-[#EBE5DC] text-[#6B6159] border-[#EBE5DC]'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-sm'
                  }`}
                >
                  <div className="relative">
                    <ClipboardList className="w-4 h-4" />
                    {totalQuoteItems > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#C41B2E] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {totalQuoteItems}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Mi lista</span>
                </button>

                {/* CTA */}
                <button
                  onClick={handleWhatsAppClick}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer bg-[#C41B2E] text-white hover:bg-[#B51426]"
                  style={{ boxShadow: '0 2px 12px rgba(196,27,46,0.25)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Cotizar
                </button>

                {/* Mobile icons — bigger when transparent (over hero) */}
                <div className="lg:hidden flex items-center gap-0.5">
                  {totalQuoteItems > 0 && (
                    <button
                      onClick={() => setIsQuoteOpen(true)}
                      className={`relative flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                        isScrolled
                          ? 'w-11 h-11 text-[#6B6159] hover:bg-[#F4F0E8]'
                          : 'w-12 h-12 text-white hover:bg-white/10'
                      }`}
                      aria-label="Mi lista de cotización"
                    >
                      <ClipboardList className={isScrolled ? 'w-5 h-5' : 'w-6 h-6'} />
                      <span className="absolute top-2 right-2 w-[17px] h-[17px] bg-[#C41B2E] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {totalQuoteItems}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      isScrolled
                        ? 'w-11 h-11 text-[#1A1613] hover:bg-[#F4F0E8]'
                        : 'w-12 h-12 text-white hover:bg-white/10'
                    }`}
                    aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                  >
                    {isMobileMenuOpen
                      ? <X className={isScrolled ? 'w-6 h-6' : 'w-7 h-7'} />
                      : <Menu className={isScrolled ? 'w-6 h-6' : 'w-7 h-7'} />
                    }
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </nav>

      {/* ── Quote Sheet ─────────────────────────────────────────── */}
      <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden bg-white border-[#EBE5DC]">

          <SheetHeader className="px-5 py-4 border-b border-[#EBE5DC] flex-shrink-0">
            <SheetTitle className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-[#C41B2E]" />
              <span className="font-semibold text-[#1A1613] tracking-tight text-base">Mi lista</span>
              {totalQuoteItems > 0 && (
                <span className="ml-auto text-[11px] font-medium text-[#9E9080] bg-[#F4F0E8] px-2.5 py-1 rounded-sm border border-[#EBE5DC]">
                  {totalQuoteItems} {totalQuoteItems === 1 ? 'producto' : 'productos'}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {quoteItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-14 h-14 border border-[#EBE5DC] rounded-sm flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-[#C0B5A8]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1613] mb-1">Lista vacía</p>
                <p className="text-xs text-[#9E9080] max-w-[200px] leading-relaxed">
                  Explorá el catálogo y agregá productos para cotizar juntos.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {quoteItems.map((item) => (
                  <div key={item.product.id} className="border border-[#EBE5DC] rounded-sm overflow-hidden bg-[#FAF8F4]">
                    <div className="flex gap-3 p-3">
                      <img
                        src={getCategoryImage(item.product.category)}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-sm flex-shrink-0 bg-[#EBE5DC]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-[#C41B2E] uppercase tracking-[0.12em] mb-0.5">
                          {item.product.category}
                        </p>
                        <h4 className="text-[12px] font-semibold text-[#1A1613] leading-snug line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] font-mono text-[#9E9080] mt-0.5">#{item.product.sku}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFromQuote?.(item.product.id)}
                        className="p-1.5 text-[#C0B5A8] hover:text-[#C41B2E] transition-colors cursor-pointer flex-shrink-0 self-start"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 px-3 pb-3 border-t border-[#EBE5DC] pt-2.5">
                      <div className="flex items-center border border-[#EBE5DC] rounded-sm overflow-hidden bg-white">
                        <button
                          onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-[#9E9080] hover:bg-[#F4F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#1A1613] border-x border-[#EBE5DC]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#9E9080] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedItem(expandedItem === item.product.id ? null : item.product.id)}
                        className="text-[11px] font-medium text-[#9E9080] hover:text-[#C41B2E] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {expandedItem === item.product.id ? (
                          <><ChevronUp className="w-3 h-3" /> Ocultar notas</>
                        ) : (
                          <><ChevronDownIcon className="w-3 h-3" /> Añadir nota</>
                        )}
                      </button>
                    </div>

                    {expandedItem === item.product.id && (
                      <div className="px-3 pb-3">
                        <Textarea
                          placeholder="Especificaciones, consultas..."
                          value={item.notes}
                          onChange={(e) => onUpdateNotes?.(item.product.id, e.target.value)}
                          className="text-xs resize-none rounded-sm border-[#EBE5DC] bg-white text-[#1A1613] placeholder:text-[#C0B5A8] focus:border-[#C41B2E]"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {quoteItems.length > 0 && (
            <div className="px-5 py-4 border-t border-[#EBE5DC] flex-shrink-0 space-y-2 bg-white">
              <button
                onClick={handleSendQuote}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-sm transition-colors cursor-pointer"
                style={{ background: '#25d366', boxShadow: '0 2px 16px rgba(37,211,102,0.2)' }}
              >
                <MessageCircle className="w-4 h-4" />
                Enviar lista por WhatsApp
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClearQuote}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#9E9080] hover:text-[#C41B2E] border border-[#EBE5DC] rounded-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Vaciar
                </button>
                <button
                  onClick={() => setIsQuoteOpen(false)}
                  className="flex-1 h-9 text-[11px] font-medium text-[#9E9080] hover:text-[#1A1613] border border-[#EBE5DC] rounded-sm transition-colors cursor-pointer"
                >
                  Seguir viendo
                </button>
              </div>
            </div>
          )}

        </SheetContent>
      </Sheet>

      {/* ── Mobile menu ─────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[55] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 w-full max-w-[320px] h-full bg-white border-l border-[#EBE5DC] shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header del menú — 64px igual que la navbar */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#EBE5DC]">
            <img
              src="/images/logo/Logo.png"
              alt={companyConfig.name}
              className="h-7 w-auto"
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6159] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 flex flex-col h-[calc(100%-64px)] overflow-y-auto">
            <button
              onClick={() => { setIsMobileMenuOpen(false); setIsQuoteOpen(true); }}
              className="flex items-center gap-3 w-full p-3.5 bg-[#FAF8F4] hover:bg-[#F4F0E8] rounded-sm mb-5 transition-colors cursor-pointer border border-[#EBE5DC]"
            >
              <div className="relative w-9 h-9 border border-[#EBE5DC] rounded-sm flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-[#C41B2E]" />
                {totalQuoteItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C41B2E] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {totalQuoteItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold text-[#1A1613] text-sm">Mi lista de cotización</span>
                <span className="block text-[11px] text-[#9E9080] mt-0.5">
                  {totalQuoteItems > 0 ? `${totalQuoteItems} producto${totalQuoteItems !== 1 ? 's' : ''}` : 'Sin productos aún'}
                </span>
              </div>
            </button>

            <div className="space-y-0.5 flex-1">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => scrollToSection('catalogo')}
                        className="flex items-center w-full text-base font-medium text-[#1A1613] px-3 py-3 rounded-sm hover:bg-[#F4F0E8] hover:text-[#C41B2E] transition-colors cursor-pointer"
                      >
                        {link.name}
                      </button>
                      <div className="pl-3 space-y-0.5">
                        {categories.slice(0, 6).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="block w-full text-left text-sm text-[#9E9080] px-3 py-2 rounded-sm hover:text-[#C41B2E] hover:bg-[rgba(196,27,46,0.06)] transition-colors cursor-pointer"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={link.action}
                      className="flex items-center w-full text-base font-medium text-[#1A1613] px-3 py-3 rounded-sm hover:bg-[#F4F0E8] hover:text-[#C41B2E] transition-colors cursor-pointer"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-[#EBE5DC] space-y-2">
              <button
                onClick={handleWhatsAppClick}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl cursor-pointer"
                style={{ background: '#25d366', boxShadow: '0 2px 12px rgba(37,211,102,0.25)' }}
              >
                <MessageCircle className="w-4 h-4" />
                Cotizar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
