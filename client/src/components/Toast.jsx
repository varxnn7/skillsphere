import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-[#0D0D14] text-[#F8FAFC] border-[#10B981]/30 shadow-[#10B981]/10',
    error: 'bg-[#0D0D14] text-[#F8FAFC] border-[#EF4444]/30 shadow-[#EF4444]/10',
    info: 'bg-[#0D0D14] text-[#F8FAFC] border-brand-cyan/30 shadow-brand-cyan/10'
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[#10B981]" />,
    error: <AlertCircle className="h-5 w-5 text-[#EF4444]" />,
    info: <Info className="h-5 w-5 text-brand-cyan" />
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm backdrop-blur-md transition-all duration-300 animate-fade-up ${typeStyles[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-slate-500 hover:text-white p-0.5 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
