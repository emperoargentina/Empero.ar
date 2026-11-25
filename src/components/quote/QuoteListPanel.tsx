import { useId, useState, useSyncExternalStore } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardList, Minus, Plus, Trash2, X, StickyNote, ArrowRight, MousePointerClick, ListChecks,
} from 'lucide-react';
import type { Product } from '@/data/products';
import type { QuoteItem } from '@/hooks/useQuoteList';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { AvailabilityBadge } from '@/components/catalog/AvailabilityBadge';
import { disponibilidadDeStock } from '@/lib/availability';
import { handleAnchorClick } from '@/lib/scroll';

interface QuoteListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QuoteItem[];
  /** Link de WhatsApp con la lista armada como mensaje. */
  whatsappHref: string;
  onRemove?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onUpdateNotes?: (productId: string, notes: string) => void;
  onClear?: () => void;
  onProductClick?: (product: Product) => void;
}

type ConfirmState = { kind: 'remove'; item: QuoteItem } | { kind: 'clear' } | null;

const MAX_QTY = 999;
const SPRING = { type: 'spring', damping: 34, stiffness: 340, mass: 0.9 } as const;

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// Media query como estado externo: sin setState en efectos.
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const STEPS = [
  { icon: MousePointerClick, text: 'Abrí un producto y elegí la variante' },
  { icon: ListChecks, text: 'Agregalo a tu lista y ajustá cantidades' },
  { icon: WhatsAppIcon, text: 'Enviá la lista por WhatsApp y cotizamos' },
];

// "Mi lista": en mobile ocupa la pantalla completa y entra desde la derecha
// como una página; desde 640px es un panel flotante a la derecha. Se cierra
// con la X, Escape o tocando afuera (desktop). Radix Dialog aporta el foco
// atrapado, Escape y el fondo inerte; framer-motion, el movimiento.
export function QuoteListPanel({
  open,
  onOpenChange,
  items,
  whatsappHref,
  onRemove,
  onUpdateQuantity,
  onUpdateNotes,
  onClear,
  onProductClick,
}: QuoteListPanelProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const [noteOpenId, setNoteOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const descId = useId();

  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const close = () => onOpenChange(false);

  const decrease = (item: QuoteItem) => {
    if (item.quantity <= 1) setConfirm({ kind: 'remove', item });
    else onUpdateQuantity?.(item.product.id, item.quantity - 1);
  };

  const panelMotion = isDesktop
    ? { initial: { x: '106%' }, animate: { x: 0 }, exit: { x: '106%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="quote-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby={descId}
              // La confirmación vive adentro: su Escape y sus clicks no cierran la lista.
              onEscapeKeyDown={(e) => { if (confirm) e.preventDefault(); }}
              onInteractOutside={(e) => { if (confirm) e.preventDefault(); }}
            >
              <motion.div
                className="quote-panel"
                {...panelMotion}
                transition={SPRING}
              >
                <header className="quote-panel__header">
                  <div className="min-w-0">
                    <Dialog.Title className="quote-panel__title">Mi lista</Dialog.Title>
                    <p className="quote-panel__subtitle">
                      {items.length > 0
                        ? `${plural(items.length, 'producto', 'productos')} · ${plural(totalUnits, 'unidad', 'unidades')}`
                        : 'Todavía no agregaste productos'}
                    </p>
                  </div>
                  <Dialog.Close className="quote-panel__close" aria-label="Cerrar mi lista">
                    <X className="w-5 h-5" aria-hidden="true" />
                  </Dialog.Close>
                </header>
                <Dialog.Description id={descId} className="sr-only">
                  Productos agregados a tu lista de cotización. Se guardan en este dispositivo.
                </Dialog.Description>

                <div className="quote-panel__body" data-lenis-prevent>
                  {items.length === 0 ? (
                    <div className="quote-empty">
                      <span className="quote-empty__icon" aria-hidden="true">
                        <ClipboardList className="w-7 h-7" />
                      </span>
                      <p className="quote-empty__title">Tu lista está vacía</p>
                      <p className="quote-empty__text">
                        Armá una lista con los equipos que necesitás y pedí la cotización de todo junto.
                      </p>
                      <ol className="quote-steps">
                        {STEPS.map(({ icon: Icon, text }, i) => (
                          <li key={text}>
                            <span className="quote-steps__n" aria-hidden="true">{i + 1}</span>
                            <span className="quote-steps__icon" aria-hidden="true">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ol>
                      <a
                        href="#catalogo"
                        onClick={(e) => handleAnchorClick(e, close)}
                        className="btn btn-primary w-full sm:w-auto"
                      >
                        Explorar catálogo
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </div>
                  ) : (
                    <>
                      <p className="quote-panel__hint">
                        <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-whatsapp-600" />
                        Enviá la lista por WhatsApp y te respondemos con precios y disponibilidad.
                      </p>
                      <ul className="quote-list">
                        <AnimatePresence initial={false}>
                          {items.map((item) => {
                            const { product } = item;
                            const noteOpen = noteOpenId === product.id;
                            const noteId = `quote-note-${product.id}`;
                            return (
                              <motion.li
                                key={product.id}
                                layout
                                className="quote-item"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className="quote-item__media">
                                  <CloudinaryImage
                                    src={product.cloudinary_url ?? product.familia_cloudinary_url}
                                    alt=""
                                    width={128}
                                    height={128}
                                    sizes="64px"
                                    className="w-full h-full object-contain"
                                    placeholderClass="w-full h-full object-contain p-2 opacity-70"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="product-card-category !mb-0.5">{product.categoria}</p>
                                  <h3 className="quote-item__name">
                                    <button
                                      type="button"
                                      onClick={() => { onProductClick?.(product); close(); }}
                                    >
                                      {product.nombre}
                                    </button>
                                  </h3>
                                  <p className="quote-item__meta">
                                    <span className="font-mono">{product.codigo}</span>
                                    <AvailabilityBadge modo={disponibilidadDeStock(product.stock)} variant="inline" size="sm" />
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setConfirm({ kind: 'remove', item })}
                                  aria-label={`Quitar ${product.nombre} de la lista`}
                                  className="quote-item__remove"
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>

                                <div className="quote-item__controls">
                                  <div className="qty-stepper qty-stepper--sm" role="group" aria-label={`Cantidad de ${product.nombre}`}>
                                    <button
                                      type="button"
                                      onClick={() => decrease(item)}
                                      className={`qty-stepper__btn ${item.quantity <= 1 ? 'qty-stepper__btn--remove' : ''}`}
                                      aria-label={item.quantity <= 1 ? 'Quitar de la lista' : 'Restar una unidad'}
                                    >
                                      {item.quantity <= 1
                                        ? <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        : <Minus className="w-4 h-4" aria-hidden="true" />}
                                    </button>
                                    <span className="qty-stepper__value" aria-live="polite">
                                      <strong key={item.quantity} className="modal-swap">{item.quantity}</strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQuantity?.(product.id, item.quantity + 1)}
                                      disabled={item.quantity >= MAX_QTY}
                                      className="qty-stepper__btn"
                                      aria-label="Sumar una unidad"
                                    >
                                      <Plus className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setNoteOpenId(noteOpen ? null : product.id)}
                                    aria-expanded={noteOpen}
                                    aria-controls={noteId}
                                    className={`quote-item__note-toggle ${item.notes ? 'has-note' : ''}`}
                                  >
                                    <StickyNote className="w-4 h-4" aria-hidden="true" />
                                    {noteOpen ? 'Listo' : item.notes ? 'Editar nota' : 'Agregar nota'}
                                  </button>
                                </div>

                                {item.notes && !noteOpen && (
                                  <p className="quote-item__note-preview">“{item.notes}”</p>
                                )}

                                <AnimatePresence initial={false}>
                                  {noteOpen && (
                                    <motion.div
                                      id={noteId}
                                      className="quote-item__note"
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                      <label htmlFor={`${noteId}-field`} className="sr-only">
                                        Nota para {product.nombre}
                                      </label>
                                      <textarea
                                        id={`${noteId}-field`}
                                        className="quote-item__textarea"
                                        placeholder="Ej.: medidas del espacio, tipo de gas, fecha de entrega…"
                                        value={item.notes}
                                        maxLength={500}
                                        rows={2}
                                        // Se abrió para escribir: el cursor va directo al campo
                                        autoFocus
                                        onChange={(e) => onUpdateNotes?.(product.id, e.target.value)}
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                    </>
                  )}
                </div>

                {items.length > 0 && (
                  <footer className="quote-panel__footer">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                      className="btn btn-lg btn-whatsapp w-full"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      Enviar consulta por WhatsApp
                    </a>
                    <div className="quote-panel__footer-actions">
                      <button
                        type="button"
                        onClick={() => setConfirm({ kind: 'clear' })}
                        className="quote-panel__text-btn quote-panel__text-btn--danger"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Vaciar lista
                      </button>
                      <button type="button" onClick={close} className="quote-panel__text-btn">
                        Seguir viendo
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </footer>
                )}

                <ConfirmDialog
                  portal={false}
                  isOpen={confirm !== null}
                  title={confirm?.kind === 'remove'
                    ? `¿Quitar "${confirm.item.product.nombre}" de tu lista?`
                    : '¿Vaciar toda la lista?'}
                  description={confirm?.kind === 'remove'
                    ? 'Podés volver a agregarlo cuando quieras.'
                    : `Se quitan los ${plural(items.length, 'producto', 'productos')} de tu lista.`}
                  confirmLabel={confirm?.kind === 'clear' ? 'Vaciar' : 'Quitar'}
                  cancelLabel="Cancelar"
                  onConfirm={() => {
                    if (confirm?.kind === 'remove') onRemove?.(confirm.item.product.id);
                    if (confirm?.kind === 'clear') onClear?.();
                    setConfirm(null);
                  }}
                  onCancel={() => setConfirm(null)}
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
