import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

export function Pagination({ currentPage, totalPages, onPrev, onNext, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-xl text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer select-none border';

  return (
    <nav aria-label="Paginación del catálogo" className="flex items-center justify-center gap-1.5 py-2">
      {/* Prev */}
      <button
        type="button"
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={`${btnBase} ${
          currentPage === 1
            ? 'border-ink-200 text-ink-300 bg-white cursor-not-allowed'
            : 'border-ink-200 text-ink-600 bg-white hover:border-brand hover:text-brand hover:bg-brand-50'
        }`}
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === null ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="w-9 h-9 flex items-center justify-center text-ink-500 text-[0.8125rem] select-none"
          >
            ···
          </span>
        ) : (
          <motion.button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Ir a página ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${btnBase} ${
              page === currentPage
                ? 'bg-brand border-brand text-white shadow-sm'
                : 'border-ink-200 text-ink-600 bg-white hover:border-brand hover:text-brand hover:bg-brand-50'
            }`}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.1 }}
          >
            {page}
          </motion.button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className={`${btnBase} ${
          currentPage === totalPages
            ? 'border-ink-200 text-ink-300 bg-white cursor-not-allowed'
            : 'border-ink-200 text-ink-600 bg-white hover:border-brand hover:text-brand hover:bg-brand-50'
        }`}
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
