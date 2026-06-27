import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ links }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#0D0D14] text-[#64748B] border-r border-[rgba(255,255,255,0.06)] transition-all duration-300 flex flex-col relative z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } h-[calc(100vh-4rem)]`}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] shadow-md focus:outline-none cursor-pointer transition-smooth"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Nav Links Container */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-brand text-white shadow-md shadow-brand-indigo/20'
                    : 'hover:bg-[rgba(255,255,255,0.05)] hover:text-white text-[#64748B]'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[rgba(255,255,255,0.06)] text-[11px] text-[#475569] text-center font-medium">
          SkillSphere v1.0.0
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
