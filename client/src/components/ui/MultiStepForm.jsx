import React from 'react';
import { Check } from 'lucide-react';

const MultiStepForm = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="w-full py-4">
      {/* Progress Bar Line Wrapper */}
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-dark-border -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-brand-indigo -translate-y-1/2 z-0 transition-all duration-300"
          style={{
            width: steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
          }}
        />

        {/* Steps Dots */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              {/* Dot */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-indigo border-brand-indigo text-white shadow-lg shadow-brand-indigo/20'
                    : isActive
                    ? 'bg-dark-surface border-brand-indigo text-brand-indigo ring-4 ring-brand-indigo/10'
                    : 'bg-dark-surface border-dark-border text-[#64748B]'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
              </div>

              {/* Title Text */}
              <span
                className={`absolute top-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-brand-indigo' : isCompleted ? 'text-slate-300' : 'text-[#64748B]'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {/* Extra space for label wrap underneath */}
      <div className="h-8" />
    </div>
  );
};

export default MultiStepForm;
