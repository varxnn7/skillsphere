import React from 'react';
import { Check } from 'lucide-react';

const MultiStepForm = ({ steps = [], currentStep = 0, onStepClick }) => {
  return (
    <div className="w-full py-4 select-none">
      {/* Progress Bar Line Wrapper with safe horizontal inset */}
      <div className="relative px-6 sm:px-10">
        {/* Background Line (inset matching padding) */}
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-4 left-10 h-0.5 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-300"
          style={{
            width:
              steps.length > 1
                ? `calc(${(currentStep / (steps.length - 1)) * 100}% * ((100% - 5rem) / 100%))`
                : '0%'
          }}
        />

        {/* Steps Dots */}
        <div className="flex items-center justify-between relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const isClickable = onStepClick && (isCompleted || idx <= currentStep);

            // Alignment helper for labels so edge labels don't overflow the container
            let labelPos = 'left-1/2 -translate-x-1/2 text-center';
            if (idx === 0) {
              labelPos = 'left-0 text-left';
            } else if (idx === steps.length - 1) {
              labelPos = 'right-0 text-right';
            }

            return (
              <div
                key={idx}
                onClick={() => isClickable && onStepClick(idx)}
                className={`flex flex-col items-center relative ${
                  isClickable ? 'cursor-pointer group' : ''
                }`}
              >
                {/* Dot */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20'
                      : isActive
                      ? 'bg-white border-orange-600 text-orange-600 ring-4 ring-orange-600/15 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                </div>

                {/* Title Text */}
                <span
                  className={`absolute top-10 whitespace-nowrap text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${labelPos} ${
                    isActive
                      ? 'text-orange-600'
                      : isCompleted
                      ? 'text-slate-800 group-hover:text-orange-600'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Extra space for label wrap underneath */}
      <div className="h-8" />
    </div>
  );
};

export default MultiStepForm;
