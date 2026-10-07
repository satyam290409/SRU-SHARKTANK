import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel, variant = 'info' }) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'info': return <Info className="w-12 h-12 text-cyan-500" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'info': return 'btn-primary';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl glass-card"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-gray-800/50 rounded-full">
                {getIcon()}
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-300">{message}</p>
              <div className="flex w-full space-x-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${getButtonClass()}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
