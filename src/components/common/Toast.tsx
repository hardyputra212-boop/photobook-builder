import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useProjectStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div
      className={`toast flex items-center gap-3 bg-surface border ${borderColors[type]} min-w-[300px] max-w-[400px] animate-fade-in`}
    >
      {icons[type]}
      <p className="text-sm text-white flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
