/**
 * Pagination — Phân trang chuẩn hoá
 *
 * @example
 *   <Pagination page={1} totalPages={10} total={120} onChange={setPage} />
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Pagination({ page, totalPages, total, onChange, loading = false, className }) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        'bg-white rounded-card shadow-card border border-neutral-200/60 px-4 py-3',
        className
      )}
    >
      <div className="text-caption text-neutral-600">
        Trang <span className="font-semibold text-neutral-900">{page}</span> / {totalPages}
        <span className="ml-2">• {total.toLocaleString('vi-VN')} kết quả</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={!canPrev}
          className={cn(
            'h-9 w-9 flex items-center justify-center rounded-btn border border-neutral-300 bg-white',
            'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={!canNext}
          className={cn(
            'h-9 w-9 flex items-center justify-center rounded-btn border border-neutral-300 bg-white',
            'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
