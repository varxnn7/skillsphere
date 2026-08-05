import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'text-orange-600 bg-orange-600/10 border-orange-600/20', desc }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center gap-4 hover:border-[rgba(255,255,255,0.08)] transition-smooth cursor-default">
      <div className={`p-3.5 rounded-xl border ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</span>
        <span className="text-2xl font-extrabold text-slate-900">{value}</span>
        {desc && <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">{desc}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
