import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    xs: 'h-3.5 w-3.5 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4'
  };

  const colorClasses = {
    primary: 'border-brand-500 border-t-transparent',
    secondary: 'border-accent-DEFAULT border-t-transparent',
    white: 'border-white border-t-transparent',
    amber: 'border-amber-500 border-t-transparent'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-solid`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
