// =============================================================================
// useQuoteList Hook - Gestión de lista de cotización
// =============================================================================
// La lista se guarda en localStorage: sobrevive a recargas y se sincroniza
// entre pestañas abiertas del sitio.

import { useState, useCallback, useEffect } from 'react';
import { type Product } from '@/data/products';

export interface QuoteItem {
  product: Product;
  quantity: number;
  notes: string;
}

/** Cantidad en la lista por id de producto (los que no están, no aparecen). */
export type QuoteQuantities = Record<string, number>;

interface UseQuoteListReturn {
  items: QuoteItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearList: () => void;
  /** Reemplaza los productos guardados por su versión más reciente del catálogo. */
  syncProducts: (products: Product[]) => void;
  totalItems: number;
}

const STORAGE_KEY = 'empero_quote_v1';
const MAX_QUANTITY = 999;

function isQuoteItem(value: unknown): value is QuoteItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<QuoteItem>;
  return typeof item.product?.id === 'string' && typeof item.quantity === 'number' && typeof item.notes === 'string';
}

function readStored(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isQuoteItem) : [];
  } catch {
    return [];
  }
}

export function useQuoteList(): UseQuoteListReturn {
  const [items, setItems] = useState<QuoteItem[]>(readStored);

  useEffect(() => {
    try {
      if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage bloqueado (modo privado, cuota) — la lista sigue en memoria.
    }
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.product.id === product.id)) return prev;
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    const safe = Math.min(Math.floor(quantity), MAX_QUANTITY);
    setItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: safe } : item))
    );
  }, []);

  const updateNotes = useCallback((productId: string, notes: string) => {
    setItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, notes } : item))
    );
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const syncProducts = useCallback((products: Product[]) => {
    if (!products.length) return;
    const byId = new Map(products.map(p => [p.id, p]));
    setItems(prev => {
      let changed = false;
      const next = prev.map(item => {
        const fresh = byId.get(item.product.id);
        if (!fresh || fresh === item.product || fresh.updated_at === item.product.updated_at) return item;
        changed = true;
        return { ...item, product: fresh };
      });
      return changed ? next : prev;
    });
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearList,
    syncProducts,
    totalItems,
  };
}
