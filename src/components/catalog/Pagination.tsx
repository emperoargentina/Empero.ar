import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const btnBase = 'p-0 rounded-lg font-medium';
  const btnSize = 'w-8 h-8 sm:w-10 sm:h-10';

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${btnSize} border-gray-200 hover:border-[#C41B2E] hover:text-[#C41B2E] disabled:opacity-50`}
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>

      {/* Mobile: X / N */}
      <div className="flex sm:hidden items-center gap-1.5 px-2">
        <span className="text-sm font-semibold text-[#1A1613]">{currentPage}</span>
        <span className="text-sm text-[#C0B5A8]">/</span>
        <span className="text-sm text-[#9E9080]">{totalPages}</span>
      </div>

      {/* Desktop: full page numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="w-10 h-10 flex items-center justify-center text-[#C0B5A8] text-sm">
                …
              </span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`${btnBase} w-10 h-10 ${
                  currentPage === page
                    ? 'bg-[#C41B2E] hover:bg-[#B51426] text-white border-transparent'
                    : 'border-gray-200 hover:border-[#C41B2E] hover:text-[#C41B2E]'
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${btnSize} border-gray-200 hover:border-[#C41B2E] hover:text-[#C41B2E] disabled:opacity-50`}
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
}
