import React from 'react';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Edit2,
  Trash2,
  Circle
} from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';
import { ICON_MAP } from '../../constants/icons';

export default function HistoryModal({
  showHistoryModal,
  setShowHistoryModal,
  viewHistoryMonth,
  setViewHistoryMonth,
  historyGroups,
  transactions,
  openAddModalForMonth,
  handleDeleteTransaction,
  handleEditClick,
  setShowImportModal,
  formatCurrency,
  confirmAction
}) {
  if (!showHistoryModal) return null;

  // Funcție pentru ștergerea întregii luni
  const handleDeleteFullMonth = (monthKey, monthLabel) => {
    confirmAction(`Ești sigur că vrei să ștergi TOATE tranzacțiile din ${monthLabel}? Această acțiune este ireversibilă.`, () => {
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
      });

      monthTransactions.forEach(t => handleDeleteTransaction(t.id, true));
      setViewHistoryMonth(null);
    });
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 overflow-y-auto animate-slide-up transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen pb-safe relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Arhivă Financiară</h2>
          </div>
          {!viewHistoryMonth && (
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium pr-3"
            >
              <Plus size={18} /> Lună Nouă
            </button>
          )}
        </div>

        <div className="p-4 space-y-6">
          {viewHistoryMonth ? (
            (() => {
              const monthTransactions = transactions
                .filter(t => {
                  const d = new Date(t.date);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  return key === viewHistoryMonth;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

              const mIncome = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
              const mExpense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
              const mSavings = monthTransactions.filter(t => t.type === 'savings').reduce((acc, t) => acc + Number(t.amount), 0);
              const mBalance = mIncome - mExpense - mSavings;

              const monthLabel = new Date(viewHistoryMonth + '-01').toLocaleDateString('ro-RO', {
                month: 'long',
                year: 'numeric'
              });

              return (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setViewHistoryMonth(null)}
                      className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    >
                      <ArrowLeft size={16} /> Înapoi
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{monthLabel}</h3>
                      {/* BUTON ȘTERGERE LUNĂ */}
                      <button 
                        onClick={() => handleDeleteFullMonth(viewHistoryMonth, monthLabel)}
                        className="p-2 text-red-100 bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                        title="Șterge toată luna"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Rezumat Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-indigo-100 text-sm font-medium mb-1">Balanță Disponibilă</p>
                    <h2 className="text-3xl font-bold mb-4">{formatCurrency(mBalance)}</h2>
                    <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-400/20 rounded-lg text-green-300">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-indigo-100">Venituri</p>
                          <p className="font-semibold text-sm">{formatCurrency(mIncome)}</p>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/20"></div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-400/20 rounded-lg text-red-300">
                          <TrendingDown size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-indigo-100">Cheltuieli</p>
                          <p className="font-semibold text-sm">{formatCurrency(mExpense)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openAddModalForMonth(viewHistoryMonth)}
                    className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Adaugă în această lună
                  </button>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Tranzacții ({monthTransactions.length})</h4>
                    {monthTransactions.map(t => {
                      const categoryObj = CATEGORIES.find(c => c.id === t.category);
                      const iconKey = categoryObj ? categoryObj.icon : t.category;
                      const isIncome = t.type === 'income';
                      const isSavings = t.type === 'savings';

                      return (
                        <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : isSavings ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                              {ICON_MAP[iconKey] || <Circle size={20} />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t.description}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(t.date).toLocaleDateString('ro-RO')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-sm ${isIncome ? 'text-green-600 dark:text-green-400' : isSavings ? 'text-purple-600 dark:text-purple-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {isIncome ? '+' : isSavings ? '' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditClick(t)} className="text-gray-300 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 p-1.5"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="space-y-4">
              {historyGroups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setViewHistoryMonth(group.id)}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                      {group.label}
                      <ChevronRight size={18} className="text-gray-300 dark:text-gray-500" />
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{group.count} tranzacții</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-500 block">VENIT</span>
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">{formatCurrency(group.income)}</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-500 block">CHELT</span>
                      <span className="text-xs font-bold text-red-700 dark:text-red-400">{formatCurrency(group.expense)}</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-500 block">ECONOMII</span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{formatCurrency(group.savings)}</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 block">BALANȚĂ</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{formatCurrency(group.income - group.expense - group.savings)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}