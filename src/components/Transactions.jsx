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
        <h2 className="text-lg font-bold">Toate Tranzacțiile</h2>
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
         
          let amountClass = 'text-gray-800';
          let bgClass = 'bg-gray-100 text-gray-600';
          let sign = '-';
          if (t.type === 'income') {
            amountClass = 'text-green-600';
            bgClass = 'bg-green-100 text-green-600';
            sign = '+';
          } else if (t.type === 'expense') {
            bgClass = 'bg-red-100 text-red-600';
          } else if (t.type === 'savings') {
            amountClass = 'text-purple-600';
            bgClass = 'bg-purple-100 text-purple-600';
            sign = '';
          }
          return (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${bgClass}`}>
                  {ICON_MAP[iconKey] || <Circle size={20}/>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{t.description}</p>
                  <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${amountClass}`}>
                  {sign}{formatCurrency(t.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditClick(t)} className="text-gray-300 hover:text-blue-500 transition p-1.5 rounded-full hover:bg-blue-50">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-full hover:bg-red-50">
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