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
    'flex items-center justify-center w-9 h-9 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer select-none border';

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={`${btnBase} ${
          currentPage === 1
            ? 'border-[#EBE5DC] text-[#C8BFB5] bg-white cursor-not-allowed'
            : 'border-[#E8E2D9] text-[#6B6159] bg-white hover:border-[#C41B2E] hover:text-[#C41B2E] hover:bg-[#FFF8F8]'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === null ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-[#7B7064] text-[13px] select-none"
          >
            ···
          </span>
        ) : (
          <motion.button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Ir a página ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${btnBase} ${
              page === currentPage
                ? 'bg-[#C41B2E] border-[#C41B2E] text-white shadow-sm'
                : 'border-[#E8E2D9] text-[#6B6159] bg-white hover:border-[#C41B2E] hover:text-[#C41B2E] hover:bg-[#FFF8F8]'
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
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className={`${btnBase} ${
          currentPage === totalPages
            ? 'border-[#EBE5DC] text-[#C8BFB5] bg-white cursor-not-allowed'
            : 'border-[#E8E2D9] text-[#6B6159] bg-white hover:border-[#C41B2E] hover:text-[#C41B2E] hover:bg-[#FFF8F8]'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
