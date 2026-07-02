import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({ columns, data = [], loading, renderRow }) => {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data];
    sorted.sort((a, b) => {
      let valA = sortKey.split('.').reduce((obj, key) => (obj ? obj[key] : null), a) ?? '';
      let valB = sortKey.split('.').reduce((obj, key) => (obj ? obj[key] : null), b) ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortKey, sortOrder]);

  return (
    <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border/60 bg-[rgba(255,255,255,0.01)] text-xs">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-4 font-bold text-[#64748B] uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-[#475569]">
                        {sortKey !== col.key ? (
                          <ArrowUpDown className="h-3 w-3" />
                        ) : sortOrder === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-brand-indigo" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-brand-indigo" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse border-b border-dark-border/40">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-white/5 rounded-lg w-5/6"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-xs font-bold text-[#64748B]">
                  No matching records found.
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => renderRow(item, idx))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
