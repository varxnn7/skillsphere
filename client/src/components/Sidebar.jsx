import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ links }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white text-slate-500 border-r border-surface-border transition-all duration-300 flex flex-col relative z-20 shadow-[2px_0_12px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } h-[calc(100vh-4rem)]`}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 -right-3.5 h-7 w-7 rounded-full bg-white border border-surface-border shadow-card flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 focus:outline-none cursor-pointer transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                    : 'hover:bg-surface-muted hover:text-slate-700 text-slate-500'
                }`
              }
              title={isCollapsed ? link.name : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-surface-border text-[11px] text-slate-300 text-center font-medium">
          SkillSphere v1.0.0
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
