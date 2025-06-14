// src/hooks/use-toast.ts
"use client"; // QUAN TRỌNG: Chỉ thị Client Component

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'info' | 'success' | 'error' | 'warning'; // Export type này

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void; // Export hàm showToast
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) { // Export ToastProvider
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(); // ID duy nhất
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động xóa toast sau 3 giây (3000ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  // Component hiển thị từng toast
  const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      // Kích hoạt animation `show` sau một thời gian ngắn
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }, []);

    const toastClass = `toast toast-${toast.type} ${isVisible ? 'show' : ''}`;

    return (
      <div className={toastClass}>
        {toast.message}
      </div>
    );
  };

  // Render các toasts vào một portal để chúng không bị ảnh hưởng bởi CSS cha
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Đảm bảo toast-container được render ở body để không bị ảnh hưởng bởi z-index của các thành phần game */}
      {typeof document !== 'undefined' && toasts.length > 0 && createPortal(
        <div className="toast-container">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() { // Export useToast
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}