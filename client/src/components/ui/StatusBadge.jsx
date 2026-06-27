import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'available':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in-progress':
      case 'funded':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'completed':
      case 'released':
      case 'accepted':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'cancelled':
      case 'rejected':
      case 'withdrawn':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'pending':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
