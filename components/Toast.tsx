
import React from 'react';

interface ToastProps {
  message: string;
  kind: string;
}

const Toast: React.FC<ToastProps> = ({ message, kind }) => {
  const getColors = () => {
    switch (kind) {
      case "success": return "bg-emerald-600 border-emerald-400";
      case "error": return "bg-red-600 border-red-400 animate-bounce";
      case "warning": return "bg-orange-600 border-orange-400";
      default: return "bg-slate-700 border-slate-500";
    }
  };

  return (
    <div className={`${getColors()} border-l-4 px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300`}>
      <span className="text-white font-bold text-sm">{message}</span>
    </div>
  );
};

export default Toast;
