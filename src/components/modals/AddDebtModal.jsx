import React from 'react';
import { X } from 'lucide-react';

export default function AddDebtModal({
  showDebtModal,
  setShowDebtModal,
  newDebt,
  setNewDebt,
  editingDebtId,
  handleSaveDebt,
  formatCurrency
}) {
  if (!showDebtModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) setShowDebtModal(false); }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up border border-transparent dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{editingDebtId ? 'Editează Datoria' : 'Datorie Nouă'}</h3>
          <button onClick={() => setShowDebtModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nume Datorie</label>
            <input
              type="text"
              value={newDebt.name}
              onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Ex: Credit Casă"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Total Împrumutat (Lei)</label>
              <input
                type="number"
                value={newDebt.total}
                onChange={(e) => setNewDebt({...newDebt, total: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Suma Rămasă (Lei)</label>
              <input
                type="number"
                value={newDebt.remaining}
                onChange={(e) => setNewDebt({...newDebt, remaining: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Rată Lunară (Lei)</label>
            <input
              type="number"
              value={newDebt.monthlyPayment}
              onChange={(e) => setNewDebt({...newDebt, monthlyPayment: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Ex: 500"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">Opțional. Folosit pentru a estima data finalizării.</p>
          </div>
        </div>
        <button
          onClick={handleSaveDebt}
          className="w-full mt-8 bg-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-amber-600 active:scale-[0.98] transition-all"
        >
          {editingDebtId ? 'Actualizează Datoria' : 'Salvează Datoria'}
        </button>
      </div>
    </div>
  );
}