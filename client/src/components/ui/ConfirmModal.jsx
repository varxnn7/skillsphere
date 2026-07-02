import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, onCancel, title, message, confirmText = 'Confirm', type = 'danger', confirmColor }) => {
  if (!isOpen) return null;

  const cancelAction = onCancel || onClose;

  const colorMap = {
    red: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20 text-white',
    green: 'bg-[#10B981] hover:bg-[#10B981]/90 focus:ring-[#10B981]/20 text-white',
    blue: 'bg-brand-indigo hover:bg-brand-indigo/90 focus:ring-brand-indigo/20 text-white'
  };

  const typeStyles = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/20 text-black',
    info: 'bg-brand-indigo hover:bg-brand-indigo/90 focus:ring-brand-indigo/20 text-white'
  };

  const activeConfirmStyle = confirmColor ? colorMap[confirmColor] : (typeStyles[type] || typeStyles.danger);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-surface w-full max-w-md rounded-2xl border border-dark-border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={cancelAction}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-dark-border hover:border-brand-indigo/50 text-[#94A3B8] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-white">{title}</h3>
          </div>

          <p className="text-xs text-[#94A3B8] leading-normal">{message}</p>

          <div className="flex gap-3 pt-3 border-t border-dark-border/40">
            <button
              onClick={cancelAction}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-white/5 border border-dark-border hover:border-brand-indigo/50 text-[#94A3B8] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeConfirmStyle}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
