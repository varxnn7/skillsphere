import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Prev */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-surface-border bg-white text-slate-400 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-surface-border transition-colors cursor-pointer shadow-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Pages */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 rounded-xl font-bold transition-all cursor-pointer ${
            currentPage === page
              ? 'bg-gradient-orange text-slate-900 shadow-md shadow-orange-500/25'
              : 'border border-surface-border bg-white text-slate-500 hover:text-orange-600 hover:border-orange-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-surface-border bg-white text-slate-400 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-surface-border transition-colors cursor-pointer shadow-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
