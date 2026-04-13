import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm border border-gray-100 dark:border-slate-700"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Confirmare Ștergere</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">{message}</p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Anulează
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition shadow-lg shadow-red-500/30"
              >
                Da, Șterge
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
