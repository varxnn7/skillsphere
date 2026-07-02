import React, { useEffect } from 'react';

const PageLoader = () => {
  useEffect(() => {
    // Simulate top navigation progress loader bar
    const bar = document.getElementById('nprogress-bar');
    if (bar) {
      bar.style.width = '30%';
      const timer = setTimeout(() => {
        bar.style.width = '100%';
      }, 200);
      return () => {
        clearTimeout(timer);
        bar.style.width = '0%';
      };
    }
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      {/* Top micro transition loading bar */}
      <div 
        id="nprogress-bar"
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-brand-indigo to-brand-purple transition-all duration-300 ease-out z-50"
        style={{ width: '0%' }}
      />
      <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest animate-pulse">Loading SkillSphere...</span>
    </div>
  );
};

export default PageLoader;
