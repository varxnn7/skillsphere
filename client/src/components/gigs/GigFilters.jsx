import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import RangeSlider from '../ui/RangeSlider';

const GigFilters = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    'Web Development',
    'Mobile Apps',
    'Design & Creative',
    'Writing & Translation',
    'Marketing & Sales',
    'Finance & Accounting'
  ];

  const experienceLevels = [
    { label: 'Entry Level', value: 'entry' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Expert', value: 'expert' }
  ];

  const handleCategoryChange = (category) => {
    onFilterChange({ ...filters, category: category === filters.category ? '' : category });
  };

  const handleLevelChange = (level) => {
    onFilterChange({ ...filters, experienceLevel: level === filters.experienceLevel ? '' : level });
  };

  const handleRemoteChange = (e) => {
    onFilterChange({ ...filters, isRemote: e.target.checked ? 'true' : '' });
  };

  const handleBudgetChange = ({ min, max }) => {
    onFilterChange({ ...filters, budgetMin: min, budgetMax: max });
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-dark-border/60">
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-brand-indigo" />
          <span className="text-sm font-extrabold text-white">Filter Search</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-brand-indigo hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Category</h4>
        <div className="flex flex-col gap-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                filters.category === cat
                  ? 'bg-brand-indigo/10 border-brand-indigo/35 text-brand-indigo font-extrabold'
                  : 'border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
              } cursor-pointer`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Slider */}
      <div className="pt-2">
        <RangeSlider
          min={500}
          max={100000}
          minValue={filters.budgetMin ? Number(filters.budgetMin) : 500}
          maxValue={filters.budgetMax ? Number(filters.budgetMax) : 100000}
          onChange={handleBudgetChange}
          label="Budget Limit (₹)"
        />
      </div>

      {/* Experience Level */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Experience Level</h4>
        <div className="flex flex-col gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleLevelChange(level.value)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                filters.experienceLevel === level.value
                  ? 'bg-brand-indigo/10 border-brand-indigo/35 text-brand-indigo font-extrabold'
                  : 'border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
              } cursor-pointer`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Toggle */}
      <div className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.01)] border border-dark-border rounded-xl">
        <span className="text-xs font-bold text-[#94A3B8]">Remote Gigs Only</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isRemote === 'true'}
            onChange={handleRemoteChange}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#94A3B8] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo peer-checked:after:bg-white" />
        </label>
      </div>
    </div>
  );
};

export default GigFilters;
