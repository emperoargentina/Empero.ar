// =============================================================================
// useQuoteList Hook - Gestión de lista de cotización
// =============================================================================

import { useState, useCallback } from 'react';
import { type Product } from '@/data/products';

export interface QuoteItem {
  product: Product;
  quantity: number;
  notes: string;
}

interface UseQuoteListReturn {
  items: QuoteItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearList: () => void;
  totalItems: number;
  isInList: (productId: string) => boolean;
  generateWhatsAppMessage: () => string;
}

export function useQuoteList(): UseQuoteListReturn {
  const [items, setItems] = useState<QuoteItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      // Check if already exists
      if (prev.some(item => item.product.id === product.id)) {
        return prev;
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const updateNotes = useCallback((productId: string, notes: string) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const isInList = useCallback((productId: string) => {
    return items.some(item => item.product.id === productId);
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const generateWhatsAppMessage = useCallback(() => {
    if (items.length === 0) return '';

    let message = 'Hola, quiero cotizar los siguientes productos:\n\n';
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.nombre}`;
      message += ` (Código: ${item.product.codigo})`;
      message += ` - Cantidad: ${item.quantity}`;
      if (item.notes) {
        message += ` - Notas: ${item.notes}`;
      }
      message += '\n';
    });

    message += `\nTotal de productos: ${totalItems}`;
    message += '\n\nQuedo atento a su respuesta. Gracias!';

    return message;
  }, [items, totalItems]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearList,
    totalItems,
    isInList,
    generateWhatsAppMessage,
  };
}
