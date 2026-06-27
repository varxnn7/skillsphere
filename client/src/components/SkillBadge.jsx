import React from 'react';

const SkillBadge = ({ name, level }) => {
  const levelStyles = {
    Beginner: 'bg-blue-500/10 text-brand-cyan border-brand-cyan/20',
    Intermediate: 'bg-purple-500/10 text-brand-purple border-brand-purple/20',
    Expert: 'bg-emerald-500/10 text-[#10B981] border-[#10B981]/20'
  };

  const currentStyle = levelStyles[level] || levelStyles['Intermediate'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {name}
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
      <span className="text-[10px] uppercase tracking-wider opacity-90">{level}</span>
    </span>
  );
};

export default SkillBadge;
