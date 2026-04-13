import React from 'react';
import { ClipboardList, AlertCircle, FolderOpen, CheckCircle, Circle, Edit2, Trash2, Plus } from 'lucide-react';

export default function Notes({ 
  noteGroups = [], 
  openNoteGroupModal, 
  handleDeleteGroup, 
  toggleSubItemCheck, 
  getGroupTotal, 
  notesTotalImpact, 
  formatCurrency 
}) {
  return (
    <div className="space-y-5 tab-animate">
      <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
        <ClipboardList className="text-indigo-500 dark:text-indigo-400"/> Notițe & Bugete
      </h2>
      
      {/* Panou Total Estimare */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-4 transition-colors duration-300">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-1">
          <AlertCircle size={18} />
          <span className="font-bold text-sm">Total Estimare Costuri</span>
        </div>
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          Cost total estimat (articole neselectate): 
          <span className="font-bold text-lg block mt-1 dark:text-indigo-300">
            {formatCurrency ? formatCurrency(notesTotalImpact) : notesTotalImpact}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {noteGroups.map((group, index) => {
          // Identificăm ID-ul (verificăm id, _id sau uid din Firebase/MongoDB)
          const groupId = group.id || group._id || group.uid;
          const items = group.items || [];
          const groupTotal = getGroupTotal ? getGroupTotal(items) : 0;
          const uncheckedCount = items.filter(i => !i.checked).length;
          
          return (
            <div key={groupId || `temp-${index}`} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <FolderOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{group.title || 'Categorie fără titlu'}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{items.length} articole ({uncheckedCount} active)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500 uppercase">Total</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency ? formatCurrency(groupTotal) : groupTotal}
                    </span>
                  </div>
                  
                  {/* Buton Editare */}
                  <button 
                    onClick={() => openNoteGroupModal(group)} 
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* Buton Ștergere - REPARAT */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!groupId) {
                        alert("Eroare: Această categorie nu are un ID valid. Ștergerea nu poate fi procesată.");
                        console.error("Obiectul grupului fără ID:", group);
                        return;
                      }
                      // Confirmarea are loc în MainApp prin ConfirmModal
                      handleDeleteGroup(groupId);
                    }} 
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Listă Articole */}
              <div className="p-2">
                {items.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-2">Niciun articol adăugat.</p>
                ) : (
                  <div className="space-y-1">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || item._id || idx}
                        onClick={() => groupId && (item.id || item._id) && toggleSubItemCheck(groupId, item.id || item._id)}
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition ${item.checked ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {item.checked ? 
                            <CheckCircle size={16} className="text-green-500 dark:text-green-400 flex-shrink-0" /> : 
                            <Circle size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          }
                          <span className={`text-sm truncate ${item.checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {item.text}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatCurrency ? formatCurrency(item.cost) : item.cost}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <button
        onClick={() => openNoteGroupModal()}
        className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-400 dark:text-gray-500 font-medium hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Categorie Nouă
      </button>
    </div>
  );
}