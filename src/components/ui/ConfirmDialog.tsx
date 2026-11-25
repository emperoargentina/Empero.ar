import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * false = se renderiza en el lugar (no en <body>). Usalo cuando el diálogo
   * se abre desde adentro de un Sheet de Radix, para que su focus trap y su
   * detección de "click afuera" lo consideren parte del Sheet.
   */
  portal?: boolean;
}

// <dialog> nativo con showModal(): el navegador maneja el foco, deja inerte
// el resto de la página, lo pone en el top layer y cierra con Escape.
// Las animaciones de entrada/salida son CSS (@starting-style, ver .confirm-dialog).
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Quitar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  portal = true,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  // No se monta hasta la primera apertura: una grilla de cards no carga
  // decenas de <dialog> cerrados en el DOM.
  const [mounted, setMounted] = useState(isOpen);
  if (isOpen && !mounted) setMounted(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const content = (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="confirm-dialog"
      onCancel={(e) => {
        // Escape: el cierre lo maneja el estado del padre.
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Click en el fondo (fuera de la caja) = cancelar.
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="confirm-dialog__box">
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <AlertTriangle className="w-5 h-5 text-brand" strokeWidth={2.25} />
          </div>
          <h2 id={titleId} className="font-sans text-[1rem] font-semibold text-ink-900 mb-1.5 leading-snug text-balance">{title}</h2>
          {description && (
            <p id={descId} className="text-[0.875rem] text-ink-600 leading-relaxed text-pretty">{description}</p>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          {/* Primer botón = foco inicial de showModal(): la opción segura. */}
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-primary flex-1"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );

  return portal ? createPortal(content, document.body) : content;
}
