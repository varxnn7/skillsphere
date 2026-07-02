import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'text-brand-indigo bg-brand-indigo/10 border-brand-indigo/20', desc }) => {
  return (
    <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center gap-4 hover:border-[rgba(255,255,255,0.08)] transition-smooth cursor-default">
      <div className={`p-3.5 rounded-xl border ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <span className="block text-xs font-bold text-[#64748B] uppercase tracking-wide">{title}</span>
        <span className="text-2xl font-extrabold text-white">{value}</span>
        {desc && <span className="block text-[10px] text-[#64748B] font-semibold mt-0.5">{desc}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
