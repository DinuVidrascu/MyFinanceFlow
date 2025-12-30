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
  formatCurrency
}) {
  if (!showHistoryModal) return null;

  // Funcție pentru ștergerea întregii luni
  const handleDeleteFullMonth = (monthKey, monthLabel) => {
    if (window.confirm(`Ești sigur că vrei să ștergi TOATE tranzacțiile din ${monthLabel}? Această acțiune este ireversibilă.`)) {
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
      });

      monthTransactions.forEach(t => handleDeleteTransaction(t.id));
      setViewHistoryMonth(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-slide-up">
      <div className="max-w-md mx-auto min-h-screen pb-safe relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Arhivă Financiară</h2>
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
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 font-medium"
                    >
                      <ArrowLeft size={16} /> Înapoi
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">{monthLabel}</h3>
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
                    className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Adaugă în această lună
                  </button>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">Tranzacții ({monthTransactions.length})</h4>
                    {monthTransactions.map(t => {
                      const categoryObj = CATEGORIES.find(c => c.id === t.category);
                      const iconKey = categoryObj ? categoryObj.icon : t.category;
                      const isIncome = t.type === 'income';
                      const isSavings = t.type === 'savings';

                      return (
                        <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : isSavings ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                              {ICON_MAP[iconKey] || <Circle size={20} />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{t.description}</p>
                              <p className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString('ro-RO')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-sm ${isIncome ? 'text-green-600' : isSavings ? 'text-purple-600' : 'text-gray-800'}`}>
                              {isIncome ? '+' : isSavings ? '' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditClick(t)} className="text-gray-300 hover:text-blue-500 p-1.5"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 p-1.5"><Trash2 size={16} /></button>
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
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                      {group.label}
                      <ChevronRight size={18} className="text-gray-300" />
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{group.count} tranzacții</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-green-600 block">VENIT</span>
                      <span className="text-xs font-bold text-green-700">{formatCurrency(group.income)}</span>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-red-600 block">CHELTUIELI</span>
                      <span className="text-xs font-bold text-red-700">{formatCurrency(group.expense)}</span>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-purple-600 block">ECONOMII</span>
                      <span className="text-xs font-bold text-purple-700">{formatCurrency(group.savings)}</span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-blue-600 block">BALANȚĂ</span>
                      <span className="text-xs font-bold text-blue-700">{formatCurrency(group.income - group.expense - group.savings)}</span>
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