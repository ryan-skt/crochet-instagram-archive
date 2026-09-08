import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-4 p-4 border-4 border-outline brutal-shadow animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              toast.type === 'error' ? 'bg-red-200' :
              toast.type === 'warning' ? 'bg-yellow-300' :
              toast.type === 'success' ? 'bg-green-300' : 'bg-white'
            }`}
          >
            {toast.type === 'error' && <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
            {toast.type === 'success' && <CheckCircle className="w-6 h-6 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-6 h-6 flex-shrink-0" />}
            
            <div className="flex-1 font-mono font-bold text-sm uppercase leading-tight pt-1">
              {toast.message}
            </div>
            
            <button onClick={() => removeToast(toast.id)} className="hover:bg-ink hover:text-white p-1 transition-colors border-2 border-transparent hover:border-outline">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
