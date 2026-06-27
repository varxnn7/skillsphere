import React from 'react';

const RangeSlider = ({ min, max, minValue, maxValue, onChange, step = 100, label = 'Budget Range' }) => {
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - step);
    onChange({ min: value, max: maxValue });
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + step);
    onChange({ min: minValue, max: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">{label}</label>
        <span className="text-sm font-bold text-white">
          ₹{minValue.toLocaleString()} - ₹{maxValue.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Min Input */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Min Budget (₹)</span>
          <input
            type="number"
            value={minValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange({ min: Number(e.target.value), max: maxValue })}
            className="w-full px-4 py-2.5 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.02)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
          />
        </div>

        {/* Max Input */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Max Budget (₹)</span>
          <input
            type="number"
            value={maxValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange({ min: minValue, max: Number(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.02)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
          />
        </div>
      </div>

      {/* Sliders overlay container */}
      <div className="relative pt-2">
        <div className="h-1.5 bg-dark-border rounded-lg relative">
          <div 
            className="absolute h-full bg-brand-indigo rounded-lg"
            style={{
              left: `${((minValue - min) / (max - min)) * 100}%`,
              right: `${100 - ((maxValue - min) / (max - min)) * 100}%`
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          step={step}
          onChange={handleMinChange}
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-indigo [&::-webkit-slider-thumb]:appearance-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          step={step}
          onChange={handleMaxChange}
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-indigo [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  );
};

export default RangeSlider;
