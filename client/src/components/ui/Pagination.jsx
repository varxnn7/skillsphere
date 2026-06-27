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
        className="p-2.5 rounded-xl border border-dark-border bg-dark-surface/50 text-[#94A3B8] hover:text-white hover:border-brand-indigo/50 disabled:opacity-40 disabled:hover:text-[#94A3B8] disabled:hover:border-dark-border transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Pages */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 rounded-xl font-bold transition-all ${
            currentPage === page
              ? 'bg-gradient-brand text-white shadow-md shadow-brand-indigo/25'
              : 'border border-dark-border bg-dark-surface/30 text-[#94A3B8] hover:text-white hover:border-brand-indigo/50'
          } cursor-pointer`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-dark-border bg-dark-surface/50 text-[#94A3B8] hover:text-white hover:border-brand-indigo/50 disabled:opacity-40 disabled:hover:text-[#94A3B8] disabled:hover:border-dark-border transition-colors cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
