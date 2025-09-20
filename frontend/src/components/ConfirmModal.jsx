import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X, CheckCircle } from "lucide-react";
import Modal from "./Modal.jsx";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  itemName = "",
  destructive = false
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isConfirming) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'info':
        return {
          icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      default: // warning
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
    >
      <div className="space-y-4">
        {/* Icon and Message */}
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${typeStyles.iconBg} flex-shrink-0`}>
            {typeStyles.icon}
          </div>
          <div className="flex-1">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {itemName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning for destructive actions */}
        {destructive && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isConfirming}
            onKeyDown={handleKeyDown}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${typeStyles.buttonClass}`}
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {destructive ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
