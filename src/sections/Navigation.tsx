// =============================================================================
// Navigation Component - Barra de navegación sticky
// =============================================================================

import { useState, useEffect } from 'react';
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
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { categories } from '@/data/products';
import { whatsappConfig } from '@/data/company';
import { companyConfig } from '@/data/company';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function Navigation({ 
  onCategorySelect,
  quoteItems = [],
  onRemoveFromQuote,
  onUpdateQuantity,
  onUpdateNotes,
  onClearQuote,
  totalQuoteItems = 0
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(whatsappConfig.defaultMessage);
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
    scrollToSection('catalogo');
    setIsMobileMenuOpen(false);
  };

  const handleSendQuote = () => {
    if (quoteItems.length === 0) return;

    let message = 'Hola, quiero cotizar los siguientes productos:\n\n';
    
    quoteItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}`;
      message += ` (SKU: ${item.product.sku})`;
      message += ` - Cant: ${item.quantity}`;
      if (item.notes) {
        message += ` - ${item.notes}`;
      }
      message += '\n';
    });

    message += `\nTotal: ${totalQuoteItems} unidades`;
    message += '\n\nQuedo atento. Gracias!';

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    setIsQuoteOpen(false);
  };

  // Get placeholder image based on category
  const getPlaceholderImage = (category: string) => {
    const categoryImages: Record<string, string> = {
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
    return categoryImages[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop';
  };

  const navLinks = [
    { name: 'Inicio', href: '#', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { 
      name: 'Productos', 
      href: '#catalogo',
      action: () => scrollToSection('catalogo'),
      hasDropdown: true 
    },
    { name: 'Manufactura', href: '#manufactura', action: () => scrollToSection('manufactura') },
    { name: 'Contacto', href: '#contacto', action: () => scrollToSection('contacto') },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg py-3'
            : 'bg-transparent py-5'
        }`}
        style={isScrolled ? {
          boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.06)',
        } : {}}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center"
            >
              <img
                src="/images/logo/Logo.png"
                alt={companyConfig.name}
                className={`h-12 w-auto transition-all duration-300 ${isScrolled ? '' : 'brightness-0 invert'}`}
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#d32f2f] ${
                            isScrolled ? 'text-gray-700' : 'text-white'
                          }`}
                        >
                          {link.name}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 max-h-80 overflow-auto">
                        <DropdownMenuItem
                          onClick={() => scrollToSection('catalogo')}
                          className="font-medium"
                        >
                          Ver todos los productos
                        </DropdownMenuItem>
                        <div className="border-t my-1" />
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                          >
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        link.action();
                      }}
                      className={`text-sm font-medium transition-colors hover:text-[#d32f2f] ${
                        isScrolled ? 'text-gray-700' : 'text-white'
                      }`}
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Quote List Button - Desktop */}
              <button
                onClick={() => setIsQuoteOpen(true)}
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isScrolled 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
              >
                <div className="relative">
                  <ClipboardList className="w-5 h-5" />
                  {totalQuoteItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#d32f2f] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalQuoteItems}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Mi lista</span>
              </button>

              {/* CTA Button */}
              <Button
                onClick={handleWhatsAppClick}
                className="hidden lg:flex btn-primary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Cotizar
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'text-gray-900 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Quote List Sheet */}
      <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-[#d32f2f]" />
              Mi lista de cotización
              {totalQuoteItems > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({totalQuoteItems} {totalQuoteItems === 1 ? 'producto' : 'productos'})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6">
            {quoteItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tu lista está vacía
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Agrega productos desde el catálogo para crear tu lista de cotización.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {quoteItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      {/* Product Header */}
                      <div className="flex gap-3">
                        {/* Image */}
                        <img
                          src={getPlaceholderImage(item.product.category)}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {item.product.sku}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center bg-white rounded-lg border border-gray-200">
                              <button
                                onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-10 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Expand Notes */}
                            <button
                              onClick={() => setExpandedItem(
                                expandedItem === item.product.id ? null : item.product.id
                              )}
                              className="text-sm text-[#d32f2f] hover:underline flex items-center gap-1"
                            >
                              {expandedItem === item.product.id ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-4 h-4" />
                                  Notas
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveFromQuote?.(item.product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Notes Section */}
                      {expandedItem === item.product.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Textarea
                            placeholder="Agrega notas o especificaciones..."
                            value={item.notes}
                            onChange={(e) => onUpdateNotes?.(item.product.id, e.target.value)}
                            className="text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleSendQuote}
                    className="w-full btn-whatsapp py-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Enviar lista por WhatsApp
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      onClick={onClearQuote}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Vaciar
                    </Button>
                    <Button
                      onClick={() => setIsQuoteOpen(false)}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      Seguir
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl transition-transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20">
            {/* Mobile Quote List Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsQuoteOpen(true);
              }}
              className="flex items-center gap-3 w-full p-4 bg-gray-50 rounded-xl mb-6"
            >
              <div className="relative">
                <ClipboardList className="w-6 h-6 text-[#d32f2f]" />
                {totalQuoteItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#d32f2f] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalQuoteItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Mi lista</span>
                <span className="block text-sm text-gray-500">
                  {totalQuoteItems > 0 
                    ? `${totalQuoteItems} productos agregados` 
                    : 'Agrega productos para cotizar'}
                </span>
              </div>
            </button>

            {/* Mobile Nav Links */}
            <div className="space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => scrollToSection('catalogo')}
                        className="block w-full text-left text-lg font-medium text-gray-900 py-2"
                      >
                        {link.name}
                      </button>
                      <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                        {categories.slice(0, 6).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="block w-full text-left text-sm text-gray-600 py-1 hover:text-[#d32f2f]"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        link.action();
                      }}
                      className="block w-full text-left text-lg font-medium text-gray-900 py-2"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 pt-6 border-t">
              <Button
                onClick={handleWhatsAppClick}
                className="w-full btn-whatsapp py-4"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Cotizar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
