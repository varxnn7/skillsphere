import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon = Sparkles, title, message, ctaText, ctaLink, buttonText, onButtonClick }) => {
  const label = buttonText || ctaText;

  return (
    <div className="bg-white p-8 rounded-2xl border border-surface-border text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-[0_0_20px_rgba(0,0,0,0.15)] w-full">
      <div className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl text-orange-600 animate-bounce">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-normal">{message}</p>
      </div>
      {onButtonClick && label && (
        <button
          onClick={onButtonClick}
          className="px-5 py-2.5 rounded-xl bg-gradient-orange hover-glow-orange text-slate-900 font-bold text-xs cursor-pointer transition-all inline-block focus:outline-none"
        >
          {label}
        </button>
      )}
      {!onButtonClick && label && ctaLink && (
        <Link
          to={ctaLink}
          className="px-5 py-2.5 rounded-xl bg-gradient-orange hover-glow-orange text-slate-900 font-bold text-xs cursor-pointer transition-all inline-block"
        >
          {label}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
