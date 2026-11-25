import { useState, useCallback, useEffect, useLayoutEffect, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Navigation } from './sections/Navigation';
import { Hero, HERO_IMAGE_SRC } from './sections/Hero';
import { ProductCatalog, type CategoryRequest } from './sections/ProductCatalog';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Preloader } from './components/Preloader';
import { ProductModal } from './components/catalog/ProductModal';
import { useQuoteList } from './hooks/useQuoteList';
import { useLenis } from './hooks/useLenis';
import { TooltipProvider } from '@/components/ui/tooltip';
import { prefetchProducts, useProducts } from './hooks/useProducts';
import { groupProducts } from './lib/groupProducts';
import { scrollToId } from './lib/scroll';
import { type Product } from './data/products';

const Nosotros = lazy(() => import('./sections/Manufactura').then(m => ({ default: m.Nosotros })));
const EnviosPostventa = lazy(() => import('./sections/EnviosPostventa').then(m => ({ default: m.EnviosPostventa })));
const ContactForm = lazy(() => import('./sections/ContactForm').then(m => ({ default: m.ContactForm })));
const Footer = lazy(() => import('./sections/Footer').then(m => ({ default: m.Footer })));

function App() {
  useLenis();
  // Escala del sitio público (ver html.site-scale en index.css); antes de
  // pintar, para que no se vea un salto de tamaño.
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('site-scale');
    return () => html.classList.remove('site-scale');
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  // Objeto nuevo en cada click: elegir dos veces la misma categoría desde el
  // menú vuelve a aplicarla aunque el catálogo haya cambiado de filtro.
  const [categoryRequest, setCategoryRequest] = useState<CategoryRequest | null>(null);

  useEffect(() => {
    const heroImageReady = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = HERO_IMAGE_SRC;
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
    syncProducts,
    totalItems,
  } = useQuoteList();

  const { allProducts } = useProducts();
  const [quoteModalProduct, setQuoteModalProduct] = useState<Product | null>(null);
  const [quoteModalVariants, setQuoteModalVariants] = useState<Product[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // La lista guardada en localStorage puede tener datos viejos (nombre, código):
  // se actualizan apenas llega el catálogo.
  useEffect(() => {
    syncProducts(allProducts);
  }, [allProducts, syncProducts]);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setCategoryRequest({ id: categoryId });
    scrollToId('catalogo');
  }, []);

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

  const quoteQuantities = useMemo(
    () => Object.fromEntries(quoteItems.map(item => [item.product.id, item.quantity])),
    [quoteItems]
  );

  return (
    <MotionConfig reducedMotion="user">
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

        <a href="#contenido" className="skip-link">Saltar al contenido</a>

        <div className={`min-h-svh bg-[var(--page-bg)] ${isLoading ? 'overflow-hidden max-h-svh' : ''}`}>
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

          <main id="contenido" tabIndex={-1} className="outline-none">
            <Hero isReady={!isLoading} />

            <ProductCatalog
              categoryRequest={categoryRequest}
              onAddToQuote={addItem}
              onRemoveFromQuote={removeItem}
              onUpdateQuoteQuantity={updateQuantity}
              quoteQuantities={quoteQuantities}
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
          onAddToQuote={addItem}
          onRemoveFromQuote={removeItem}
          onUpdateQuoteQuantity={updateQuantity}
          quoteQuantities={quoteQuantities}
        />
      </TooltipProvider>
    </MotionConfig>
  );
}

export default App;
