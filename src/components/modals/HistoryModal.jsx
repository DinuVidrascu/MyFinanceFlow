import React from 'react';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronRight,
  Edit2,
  Trash2,
  Circle,
  History as HistoryIcon
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
          {/* Buton Nou pentru Import/Creare Lună */}
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
          {/* Specific Month View OR List of Months */}
          {viewHistoryMonth ? (
            // --- DETAILED MONTH VIEW ---
            (() => {
              const monthTransactions = transactions
                .filter(t => {
                  const d = new Date(t.date);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  return key === viewHistoryMonth;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

              const mIncome = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + Number(t.amount), 0);
              const mExpense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + Number(t.amount), 0);
              const mSavings = monthTransactions
                .filter(t => t.type === 'savings')
                .reduce((acc, t) => acc + Number(t.amount), 0);
              const mBalance = mIncome - mExpense - mSavings;

              const monthLabel = new Date(viewHistoryMonth + '-01').toLocaleDateString('ro-RO', {
                month: 'long',
                year: 'numeric'
              });

              return (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setViewHistoryMonth(null)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 font-medium"
                    >
                      <ArrowLeft size={16} /> Înapoi la listă
                    </button>
                    <h3 className="text-xl font-bold text-gray-800 capitalize ml-auto">{monthLabel}</h3>
                  </div>

                  {/* Month Summary Card */}
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
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                      <span>Economisit</span>
                      <span className="font-bold text-purple-200">{formatCurrency(mSavings)}</span>
                    </div>
                  </div>

                  {/* Add Transaction Button for Specific Month */}
                  <button
                    onClick={() => openAddModalForMonth(viewHistoryMonth)}
                    className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Adaugă în această lună
                  </button>

                  {/* Transaction List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">Tranzacții ({monthTransactions.length})</h4>
                    {monthTransactions.length === 0 ? (
                      <p className="text-center text-gray-400 py-4 text-sm">Nu există tranzacții în această lună.</p>
                    ) : (
                      monthTransactions.map(t => {
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
                          <div
                            key={t.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-full ${bgClass}`}>
                                {ICON_MAP[iconKey] || <Circle size={20} />}
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
                                <button
                                  onClick={() => handleEditClick(t)}
                                  className="text-gray-300 hover:text-blue-500 transition p-1.5 rounded-full hover:bg-blue-50"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-full hover:bg-red-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            // --- LIST OF MONTHS ---
            <>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  Selectează o lună pentru a vedea detaliile complete sau adaugă o lună nouă folosind butonul de sus.
                </p>
              </div>
              <div className="space-y-4">
                {historyGroups.map(group => {
                  const balance = group.income - group.expense - group.savings;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setViewHistoryMonth(group.id)}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-blue-300 transition group"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                            {group.label}
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition" />
                          </h3>
                          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            {group.count} tranzacții
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="bg-green-50 p-2 rounded-lg text-center">
                            <span className="block text-[10px] uppercase text-green-600 font-bold">Venit</span>
                            <span className="text-xs font-bold text-green-700">{formatCurrency(group.income)}</span>
                          </div>
                          <div className="bg-red-50 p-2 rounded-lg text-center">
                            <span className="block text-[10px] uppercase text-red-600 font-bold">Cheltuieli</span>
                            <span className="text-xs font-bold text-red-700">{formatCurrency(group.expense)}</span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded-lg text-center">
                            <span className="block text-[10px] uppercase text-purple-600 font-bold">Economii</span>
                            <span className="text-xs font-bold text-purple-700">{formatCurrency(group.savings)}</span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg text-center">
                            <span className="block text-[10px] uppercase text-blue-600 font-bold">Disponibil</span>
                            <span className="text-xs font-bold text-blue-700">{formatCurrency(balance)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {historyGroups.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <HistoryIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Nu există istoric disponibil.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}