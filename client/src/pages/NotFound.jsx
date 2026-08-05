import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-orange-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-brand-purple/15 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md relative z-10 animate-fade-up">
        {/* 404 icon */}
        <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-orange-600/10 border border-orange-600/20 mx-auto mb-6">
          <SearchX className="h-10 w-10 text-orange-600" />
        </div>

        {/* Error text */}
        <h1 className="text-7xl font-black text-slate-900 mb-2 tracking-tight">
          4<span className="text-orange-600">0</span>4
        </h1>
        <h2 className="text-xl font-bold text-slate-900 mb-3">Page Not Found</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-surface-border text-slate-500 text-sm font-semibold hover:border-surface-border hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-orange text-slate-900 text-sm font-bold hover-glow-orange transition-all"
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
