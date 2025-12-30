import React from 'react';
import { X, Plus } from 'lucide-react';

export default function AddNoteModal({
  showNoteModal,
  setShowNoteModal,
  currentGroup,
  setCurrentGroup,
  handleAddSubItem,
  handleRemoveSubItem,
  handleSubItemChange,
  handleSaveNoteGroup,
  getGroupTotal,
  formatCurrency
}) {
  if (!showNoteModal) return null;

  // Funcție locală pentru a valida înainte de trimiterea spre App.js
  const onSaveClick = () => {
    if (!currentGroup.title.trim()) {
      alert("Te rog introdu un nume pentru categorie.");
      return;
    }
    handleSaveNoteGroup();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowNoteModal(false); }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {currentGroup.id ? 'Editează Lista' : 'Listă Nouă'}
          </h3>
          <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nume Categorie</label>
              <input
                type="text"
                value={currentGroup.title}
                onChange={(e) => setCurrentGroup({...currentGroup, title: e.target.value})}
                className="w-full text-xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-2 bg-transparent"
                placeholder="Ex: Renovare Baie"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Articole & Costuri</label>
                <span className="text-xs font-bold text-indigo-600">
                  Total: {formatCurrency(getGroupTotal(currentGroup.items))}
                </span>
              </div>
              
              <div className="space-y-2">
                {currentGroup.items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleSubItemChange(item.id, 'text', e.target.value)}
                        placeholder="Nume articol"
                        className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleSubItemChange(item.id, 'cost', e.target.value)}
                        placeholder="0"
                        className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-right"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSubItem(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSubItem}
                className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus size={16} /> Adaugă Articol
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onSaveClick}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Salvează Lista
          </button>
        </div>
      </div>
    </div>
  );
}