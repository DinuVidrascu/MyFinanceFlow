import React from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';
import { ICON_MAP } from '../../constants/icons';

export default function AddTransactionModal({
  showAddModal,
  setShowAddModal,
  newTrans,
  setNewTrans,
  editingId,
  handleSaveTransaction,
  formatCurrency // nu e folosit direct, dar îl păstrăm pentru consistență
}) {
  if (!showAddModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Editează Tranzacția' : 'Tranzacție Nouă'}</h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
            <X size={24} />
          </button>
        </div>
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setNewTrans({...newTrans, type: 'expense'})}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition ${newTrans.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
          >
            Cheltuială
          </button>
          <button
            onClick={() => setNewTrans({...newTrans, type: 'income'})}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition ${newTrans.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            Venit
          </button>
          <button
            onClick={() => setNewTrans({...newTrans, type: 'savings'})}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition ${newTrans.type === 'savings' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
          >
            Economii
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sumă (Lei)</label>
            <input
              type="number"
              value={newTrans.amount}
              onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})}
              className="w-full text-3xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-blue-600 outline-none py-2 bg-transparent"
              placeholder="0"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Data Tranzacției</label>
            <input
              type="date"
              value={newTrans.date}
              onChange={(e) => setNewTrans({...newTrans, date: e.target.value})}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descriere</label>
            <input
              type="text"
              value={newTrans.description}
              onChange={(e) => setNewTrans({...newTrans, description: e.target.value})}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Ex: Pusi la ciorap"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Categorie</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c.type === newTrans.type).slice(0, 8).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setNewTrans({...newTrans, category: cat.id})}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${newTrans.category === cat.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                >
                  <div className="mb-1">{ICON_MAP[cat.icon]}</div>
                  <span className="text-[10px] font-medium truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
              {CATEGORIES.filter(c => c.type === newTrans.type).length === 0 && (
                <div className="col-span-4 text-center text-xs text-gray-400 py-2">
                  Selectează un tip pentru a vedea categoriile.
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveTransaction}
          className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          {editingId ? 'Actualizează' : 'Salvează Tranzacția'}
        </button>
      </div>
    </div>
  );
}