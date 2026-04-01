import React from 'react';
import { Plus, Edit2, Trash2, Circle } from 'lucide-react';

export default function Transactions({ 
  transactions, 
  openAddModal, 
  handleEditClick, 
  handleDeleteTransaction, 
  formatCurrency, 
  ICON_MAP, 
  CATEGORIES 
}) {
  return (
    <div className="space-y-4 pb-20 tab-animate">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold dark:text-white">Toate Tranzacțiile</h2>
        <button onClick={openAddModal} className="bg-blue-600 text-white p-2 rounded-lg flex items-center gap-1 shadow-md hover:bg-blue-700">
          <Plus size={18} /> <span className="text-sm font-medium">Adaugă</span>
        </button>
      </div>
     
      {transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>Nu există tranzacții înregistrate.</p>
        </div>
      ) : (
        transactions.map(t => {
          const categoryObj = CATEGORIES.find(c => c.id === t.category);
          const iconKey = categoryObj ? categoryObj.icon : t.category;
         
          let amountClass = 'text-gray-800 dark:text-gray-200';
          let bgClass = 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300';
          let sign = '-';
          if (t.type === 'income') {
            amountClass = 'text-green-600 dark:text-green-400';
            bgClass = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            sign = '+';
          } else if (t.type === 'expense') {
            bgClass = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
          } else if (t.type === 'savings') {
            amountClass = 'text-purple-600 dark:text-purple-400';
            bgClass = 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            sign = '';
          }
          return (
            <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between group transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${bgClass}`}>
                  {ICON_MAP[iconKey] || <Circle size={20}/>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{t.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.date).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${amountClass}`}>
                  {sign}{formatCurrency(t.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditClick(t)} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-slate-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}