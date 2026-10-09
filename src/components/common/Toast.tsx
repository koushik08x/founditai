import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950',
    info: 'border-blue-200 bg-blue-50/90 text-blue-950'
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-sm font-semibold">{toast.title}</h4>
            )}
            <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
