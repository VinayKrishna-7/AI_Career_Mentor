import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'success', message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => addToast({ type: 'success', message, duration }),
    error: (message, duration) => addToast({ type: 'error', message, duration }),
    info: (message, duration) => addToast({ type: 'info', message, duration }),
    warning: (message, duration) => addToast({ type: 'warning', message, duration }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Bottom-Right Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-3rem)] pointer-events-none select-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 border-l-4 bg-[#ffffff]/98 dark:bg-[#101312]/98 border-[#ded6c5] dark:border-[#2A302D] border-l-[#2A8278] dark:border-l-[#2A8278] text-stone-900 dark:text-[#F5F4EF] shadow-lg"
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-md bg-[#f5efe4] dark:bg-[#222825] border border-[#ded6c5] dark:border-[#2A302D] text-[#2A8278] dark:text-[#D5B777] flex items-center justify-center">
                {t.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2A8278]" />}
                {t.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                {t.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-[#D5B777]" />}
                {t.type === 'info' && <Info className="w-3.5 h-3.5 text-[#2A8278]" />}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-xs font-semibold leading-relaxed pt-0.5">
              {t.message}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
