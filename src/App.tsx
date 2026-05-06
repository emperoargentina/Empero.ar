import { useState, useCallback } from 'react';
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

function App() {
  useLenis();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

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
    </>
  );
}

export default App;
