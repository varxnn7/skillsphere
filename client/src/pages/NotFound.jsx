import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-brand-indigo/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-brand-purple/15 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md relative z-10 animate-fade-up">
        {/* 404 icon */}
        <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-brand-indigo/10 border border-brand-indigo/20 mx-auto mb-6">
          <SearchX className="h-10 w-10 text-brand-indigo" />
        </div>

        {/* Error text */}
        <h1 className="text-7xl font-black text-white mb-2 tracking-tight">
          4<span className="text-brand-indigo">0</span>4
        </h1>
        <h2 className="text-xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dark-border text-[#94A3B8] text-sm font-semibold hover:border-white/20 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-brand text-white text-sm font-bold hover-glow-purple transition-all"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
