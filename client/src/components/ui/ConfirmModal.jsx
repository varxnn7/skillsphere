import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, onCancel, title, message, confirmText = 'Confirm', type = 'danger', confirmColor }) => {
  if (!isOpen) return null;

  const cancelAction = onCancel || onClose;

  const colorMap = {
    red: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20 text-white',
    green: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 text-white',
    blue: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20 text-white',
  };

  const typeStyles = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/20 text-white',
    info: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20 text-white'
  };

  const activeConfirmStyle = confirmColor ? colorMap[confirmColor] : (typeStyles[type] || typeStyles.danger);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden relative animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={cancelAction}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-muted border border-surface-border hover:border-orange-300 hover:text-orange-600 text-slate-400 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-slate-900">{title}</h3>
          </div>

          <p className="text-xs text-slate-500 leading-normal">{message}</p>

          <div className="flex gap-3 pt-3 border-t border-surface-border">
            <button
              onClick={cancelAction}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-surface-muted border border-surface-border hover:border-slate-400 text-slate-600 cursor-pointer transition-colors"
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
