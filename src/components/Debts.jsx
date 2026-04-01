import React from 'react';
import { CreditCard, Edit2, Trash2 } from 'lucide-react';

export default function Debts({ 
  debts, 
  openDebtModal, 
  handleEditDebt, 
  handleDeleteDebt, 
  formatCurrency 
}) {
  return (
    <div className="space-y-6 tab-animate">
      <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <CreditCard className="text-amber-500 dark:text-amber-400"/> Evidență Datorii
      </h2>
      {debts.map(debt => {
        const paid = debt.total - debt.remaining;
        const progress = debt.total > 0 ? (paid / debt.total) * 100 : 0;
        const monthsLeft = debt.monthlyPayment > 0 ? Math.ceil(debt.remaining / debt.monthlyPayment) : 0;
        return (
          <div key={debt.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 dark:text-white">{debt.name}</span>
                {debt.monthlyPayment > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Rată: {formatCurrency(debt.monthlyPayment)} / lună</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                  {progress.toFixed(0)}% Achitat
                </span>
                <button onClick={() => handleEditDebt(debt)} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition p-1 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteDebt(debt.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition p-1 rounded-full hover:bg-red-50 dark:hover:bg-slate-700">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
           
            <div className="h-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <div>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Total Împrumutat</p>
                <p className="font-semibold text-gray-800 dark:text-white">{formatCurrency(debt.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 dark:text-gray-500 text-xs">Sumă Rămasă</p>
                <p className="font-semibold text-red-500 dark:text-red-400">{formatCurrency(debt.remaining)}</p>
              </div>
            </div>
            {monthsLeft > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                <span className="text-gray-400 dark:text-gray-500">Estimare finalizare:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{monthsLeft} luni</span>
              </div>
            )}
          </div>
        )
      })}
      <button onClick={openDebtModal} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-400 dark:text-gray-500 font-medium hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-500 dark:hover:text-amber-400 transition">
        + Adaugă Datorie Nouă
      </button>
    </div>
  );
}