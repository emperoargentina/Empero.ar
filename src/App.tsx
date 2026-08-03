import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { ProductCatalog } from './sections/ProductCatalog';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Preloader } from './components/Preloader';
import { ProductModal } from './components/catalog/ProductModal';
import { useQuoteList } from './hooks/useQuoteList';
import { useLenis } from './hooks/useLenis';
import { TooltipProvider } from '@/components/ui/tooltip';
import { prefetchProducts, useProducts } from './hooks/useProducts';
import { groupProducts } from './lib/groupProducts';
import { type Product } from './data/products';
import { ScrollTrigger } from '@/lib/gsap';

const Nosotros = lazy(() => import('./sections/Manufactura').then(m => ({ default: m.Nosotros })));
const EnviosPostventa = lazy(() => import('./sections/EnviosPostventa').then(m => ({ default: m.EnviosPostventa })));
const ContactForm = lazy(() => import('./sections/ContactForm').then(m => ({ default: m.ContactForm })));
const Footer = lazy(() => import('./sections/Footer').then(m => ({ default: m.Footer })));

function App() {
  useLenis();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const heroImageReady = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = '/images/Visuales/HeroImage.webp';
    });
    Promise.all([prefetchProducts(), heroImageReady]).finally(() => setIsDataReady(true));
  }, []);

  const {
    items: quoteItems,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearList,
    totalItems,
  } = useQuoteList();

  const { allProducts } = useProducts();
  const [quoteModalProduct, setQuoteModalProduct] = useState<Product | null>(null);
  const [quoteModalVariants, setQuoteModalVariants] = useState<Product[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // ScrollTrigger midió posiciones mientras el wrapper tenía overflow-hidden
  // (altura real ocultada durante el preload) — hay que recalcular una vez
  // que el layout final queda visible, o el scroll queda desincronizado.
  useEffect(() => {
    if (isLoading) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isLoading]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAddToQuote = useCallback((product: typeof quoteItems[0]['product']) => {
    addItem(product);
  }, [addItem]);

  const handleOpenProductFromQuote = useCallback((product: Product) => {
    const group = groupProducts(allProducts).find(g =>
      g.variants.some(v => v.id === product.id)
    );
    setQuoteModalProduct(product);
    setQuoteModalVariants(group?.variants ?? [product]);
    setIsQuoteModalOpen(true);
  }, [allProducts]);

  const handleCloseQuoteModal = useCallback(() => {
    setIsQuoteModalOpen(false);
    setTimeout(() => {
      setQuoteModalProduct(null);
      setQuoteModalVariants([]);
    }, 200);
  }, []);

  const quoteListIds = quoteItems.map(item => item.product.id);

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isLoading && (
          <Preloader
            key="preloader"
            onComplete={handlePreloaderComplete}
            isDataReady={isDataReady}
          />
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-[#FAFAF8] ${isLoading ? 'overflow-hidden max-h-screen' : ''}`}>
        <Navigation
          onCategorySelect={handleCategorySelect}
          quoteItems={quoteItems}
          onRemoveFromQuote={removeItem}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onClearQuote={clearList}
          totalQuoteItems={totalItems}
          onProductClick={handleOpenProductFromQuote}
        />

        <main>
          <Hero isReady={!isLoading} />

          <ProductCatalog
            initialCategory={selectedCategory}
            onAddToQuote={handleAddToQuote}
            onRemoveFromQuote={removeItem}
            quoteListIds={quoteListIds}
          />

          <Suspense fallback={null}><Nosotros /></Suspense>

          <Suspense fallback={null}><EnviosPostventa /></Suspense>

          <Suspense fallback={null}><ContactForm /></Suspense>
        </main>

        <Suspense fallback={null}>
          <Footer onCategorySelect={handleCategorySelect} />
        </Suspense>

        <WhatsAppFloat />
      </div>

      <ProductModal
        product={quoteModalProduct}
        variants={quoteModalVariants}
        isOpen={isQuoteModalOpen}
        onClose={handleCloseQuoteModal}
        onAddToQuote={handleAddToQuote}
        onRemoveFromQuote={removeItem}
        quoteListIds={quoteListIds}
      />
    </TooltipProvider>
  );
}

export default App;
