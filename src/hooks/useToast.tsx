import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => (prev.length > 0 ? prev.filter((t) => t.id !== id) : prev));
  }, []);

  const addToast = useCallback((
    message: string,
    type: ToastType = 'info',
    title?: string,
    duration = 3500
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => {
    addToast(message, 'success', title);
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast(message, 'error', title);
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast(message, 'warning', title);
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast(message, 'info', title);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100 shadow-emerald-950/30'
              : toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-100 shadow-rose-950/30'
              : toast.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-100 shadow-amber-950/30'
              : 'bg-slate-900/90 border-slate-700/50 text-slate-100 shadow-black/40'
          }`}
          role="alert"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>

          <div className="flex-1 min-w-0">
            {toast.title && <p className="font-semibold text-sm mb-0.5">{toast.title}</p>}
            <p className="text-xs sm:text-sm opacity-90 break-words leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
