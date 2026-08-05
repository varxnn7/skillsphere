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
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-bold text-slate-800">
          ₹{minValue.toLocaleString()} - ₹{maxValue.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Min Input */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Budget (₹)</span>
          <input
            type="number"
            value={minValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange({ min: Number(e.target.value), max: maxValue })}
            className="input-clean"
          />
        </div>

        {/* Max Input */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Budget (₹)</span>
          <input
            type="number"
            value={maxValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange({ min: minValue, max: Number(e.target.value) })}
            className="input-clean"
          />
        </div>
      </div>

      {/* Sliders overlay container */}
      <div className="relative pt-2">
        <div className="h-1.5 bg-surface-border rounded-lg relative">
          <div 
            className="absolute h-full bg-orange-500 rounded-lg"
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
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:appearance-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          step={step}
          onChange={handleMaxChange}
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  );
};

export default RangeSlider;
