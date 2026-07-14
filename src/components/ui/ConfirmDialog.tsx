import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Quitar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
          />

          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label={title}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] rounded-2xl bg-white pointer-events-auto overflow-hidden"
              style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.15)' }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-6 pt-6 pb-5 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF0F1] border border-[#F5C5C9] flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#C41B2E]" strokeWidth={2.25} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1A1613] mb-1.5 leading-snug">{title}</h3>
                {description && (
                  <p className="text-[12.5px] text-[#7B7064] leading-relaxed">{description}</p>
                )}
              </div>

              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                  className="flex-1 h-10 rounded-xl text-[12.5px] font-semibold text-[#6B6159] border border-[#E8E2D9] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                  className="flex-1 h-10 rounded-xl text-[12.5px] font-semibold text-white bg-[#C41B2E] hover:bg-[#B51426] transition-colors cursor-pointer shadow-sm shadow-red-900/20"
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
