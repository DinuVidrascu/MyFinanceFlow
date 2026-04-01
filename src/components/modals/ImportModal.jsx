import React from 'react';
import { X, CopyPlus } from 'lucide-react';

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  importConfig,
  setImportConfig,
  handleImportMonth,
  historyGroups
}) {
  if (!showImportModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) setShowImportModal(false); }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up border border-transparent dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Lună Nouă / Import</h3>
          <button onClick={() => setShowImportModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 text-xs text-blue-800 dark:text-blue-300 mb-4">
            Poți crea o lună nouă importând automat tranzacțiile dintr-o lună anterioară (ex: salariu, chirie).
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Luna Țintă (Nouă)</label>
            <input
              type="month"
              value={importConfig.target}
              onChange={(e) => setImportConfig({...importConfig, target: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Importă din (Opțional)</label>
            <select
              value={importConfig.source}
              onChange={(e) => setImportConfig({...importConfig, source: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-800 dark:text-white appearance-none"
            >
              <option value="">-- Fără Import (Gol) --</option>
              {historyGroups.map(group => (
                <option key={group.id} value={group.id}>{group.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleImportMonth}
            disabled={!importConfig.target}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CopyPlus size={18} /> {importConfig.source ? 'Importă & Creează' : 'Creează Lună'}
          </button>
        </div>
      </div>
    </div>
  );
}