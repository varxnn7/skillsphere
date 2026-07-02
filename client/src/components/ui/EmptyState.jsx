import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon = Sparkles, title, message, ctaText, ctaLink, buttonText, onButtonClick }) => {
  const label = buttonText || ctaText;

  return (
    <div className="bg-dark-surface p-8 rounded-2xl border border-dark-border text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-[0_0_20px_rgba(0,0,0,0.15)] w-full">
      <div className="p-4 bg-brand-indigo/10 border border-brand-indigo/20 rounded-2xl text-brand-indigo animate-bounce">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-[#94A3B8] mt-1.5 leading-normal">{message}</p>
      </div>
      {onButtonClick && label && (
        <button
          onClick={onButtonClick}
          className="px-5 py-2.5 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs cursor-pointer transition-all inline-block focus:outline-none"
        >
          {label}
        </button>
      )}
      {!onButtonClick && label && ctaLink && (
        <Link
          to={ctaLink}
          className="px-5 py-2.5 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs cursor-pointer transition-all inline-block"
        >
          {label}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
