import { useEffect, useRef } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import anime from "animejs";

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = "default", // default, success, warning, error, info
  size = "md", // sm, md, lg, xl
  showCloseButton = true,
  closeOnOverlayClick = true
}) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Animate modal in
      anime({
        targets: [overlayRef.current, modalRef.current],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo'
      });
      
      anime({
        targets: modalRef.current,
        scale: [0.8, 1],
        duration: 300,
        easing: 'easeOutBack'
      });
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          icon: null,
          iconBg: '',
          borderColor: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={`w-full ${getSizeStyles()} bg-white dark:bg-slate-800 rounded-xl shadow-2xl border ${typeStyles.borderColor} transform transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            {typeStyles.icon && (
              <div className={`p-2 rounded-full ${typeStyles.iconBg}`}>
                {typeStyles.icon}
              </div>
            )}
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {title}
            </h2>
          </div>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
