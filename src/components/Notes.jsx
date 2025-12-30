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
      <h2 className="text-lg font-bold flex items-center gap-2">
        <ClipboardList className="text-indigo-500"/> Notițe & Bugete
      </h2>
      
      {/* Panou Total Estimare */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
        <div className="flex items-center gap-2 text-indigo-700 mb-1">
          <AlertCircle size={18} />
          <span className="font-bold text-sm">Total Estimare Costuri</span>
        </div>
        <p className="text-xs text-indigo-600">
          Cost total estimat (articole neselectate): 
          <span className="font-bold text-lg block mt-1">
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
            <div key={groupId || `temp-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <FolderOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{group.title || 'Categorie fără titlu'}</h3>
                    <p className="text-[10px] text-gray-400">{items.length} articole ({uncheckedCount} active)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <span className="block text-[10px] text-gray-400 uppercase">Total</span>
                    <span className="font-bold text-indigo-600">
                      {formatCurrency ? formatCurrency(groupTotal) : groupTotal}
                    </span>
                  </div>
                  
                  {/* Buton Editare */}
                  <button 
                    onClick={() => openNoteGroupModal(group)} 
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
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
                      // Confirmare înainte de ștergere
                      if (window.confirm(`Sigur vrei să ștergi categoria "${group.title}"?`)) {
                        handleDeleteGroup(groupId);
                      }
                    }} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition"
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
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition ${item.checked ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {item.checked ? 
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> : 
                            <Circle size={16} className="text-gray-300 flex-shrink-0" />
                          }
                          <span className={`text-sm truncate ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {item.text}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
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
        className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-medium hover:border-indigo-400 hover:text-indigo-500 transition flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Categorie Nouă
      </button>
    </div>
  );
}