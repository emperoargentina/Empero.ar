import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ currentPage, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btnBase =
    'flex items-center justify-center w-10 h-10 rounded-xl border text-[13px] font-medium transition-all duration-150 cursor-pointer select-none';

  return (
    <div className="flex items-center justify-center gap-4 py-2">
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

      <span className="text-[13px] font-medium text-[#3A3530] tabular-nums select-none min-w-[80px] text-center">
        <span className="font-semibold text-[#1A1613]">{currentPage}</span>
        <span className="text-[#C0B5A8] mx-1.5">/</span>
        <span className="text-[#9A8E82]">{totalPages}</span>
      </span>

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
