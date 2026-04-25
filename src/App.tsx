// =============================================================================
// App Component - Aplicación principal
// =============================================================================

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
  
  // Quote list functionality
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
    // Scroll to catalog
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleAddToQuote = useCallback((product: typeof quoteItems[0]['product']) => {
    addItem(product);
  }, [addItem]);

  // Get quote list IDs for quick lookup
  const quoteListIds = quoteItems.map(item => item.product.id);

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      <div className={`min-h-screen bg-white ${isLoading ? 'overflow-hidden max-h-screen' : ''}`}>
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
            quoteListIds={quoteListIds}
          />
          
          <Nosotros />
          
          <ContactForm />
        </main>

        <Footer />
        
        {/* WhatsApp Float Button */}
        <WhatsAppFloat />
      </div>
    </>
  );
}

export default App;
