import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(t => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
          error: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
        };

        const bg = {
          success: 'bg-slate-900 text-white border-slate-700',
          warning: 'bg-slate-900 text-white border-amber-500/50',
          info: 'bg-slate-900 text-white border-indigo-500/50',
          error: 'bg-slate-900 text-white border-red-500/50'
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200 ${bg[t.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[t.type]}
              <span>{t.text}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
