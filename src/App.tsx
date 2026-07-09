import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { ProductCatalog } from './sections/ProductCatalog';
import { Nosotros } from './sections/Manufactura';
import { ContactForm } from './sections/ContactForm';
import { Footer } from './sections/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Preloader } from './components/Preloader';
import { useQuoteList } from './hooks/useQuoteList';
import { useLenis } from './hooks/useLenis';
import { TooltipProvider } from '@/components/ui/tooltip';
import { prefetchProducts } from './hooks/useProducts';

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

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAddToQuote = useCallback((product: typeof quoteItems[0]['product']) => {
    addItem(product);
  }, [addItem]);

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
        />

        <main>
          <Hero isReady={!isLoading} />

          <ProductCatalog
            initialCategory={selectedCategory}
            onAddToQuote={handleAddToQuote}
            onRemoveFromQuote={removeItem}
            quoteListIds={quoteListIds}
          />

          <Nosotros />

          <ContactForm />
        </main>

        <Footer />

        <WhatsAppFloat />
      </div>
    </TooltipProvider>
  );
}

export default App;
