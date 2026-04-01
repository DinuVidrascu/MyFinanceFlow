import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard({ 
  currentMonthTotals, 
  transactions, 
  formatCurrency, 
  ICON_MAP, 
  CATEGORIES 
}) {
  return (
    <div className="space-y-6 tab-animate">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <div className="flex justify-between items-start mb-1">
          <p className="text-blue-100 text-sm font-medium">Balanță Disponibilă</p>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium">LIVE</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">{formatCurrency(currentMonthTotals.balance)}</h2>
       
        <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-400/20 rounded-lg text-green-300">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-xs text-blue-100">Venituri</p>
              <p className="font-semibold text-sm">{formatCurrency(currentMonthTotals.income)}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-400/20 rounded-lg text-red-300">
              <TrendingDown size={16} />
            </div>
            <div>
              <p className="text-xs text-blue-100">Cheltuieli</p>
              <p className="font-semibold text-sm">{formatCurrency(currentMonthTotals.expense)}</p>
            </div>
          </div>
        </div>
        {/* Sectiune Economii in Card */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-400/20 rounded-lg text-purple-300">
              <PiggyBank size={16} />
            </div>
            <span className="text-xs text-blue-100">Pus "la ciorap" (Economii)</span>
          </div>
          <span className="font-bold text-sm text-purple-200">{formatCurrency(currentMonthTotals.savings)}</span>
        </div>
      </div>

      {/* Savings Projections */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="text-purple-500 dark:text-purple-400" size={20} />
          <h3 className="font-bold text-gray-800 dark:text-white">Proiecții Economisire</h3>
        </div>
       
        {currentMonthTotals.balance > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">6 Luni</p>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{formatCurrency(currentMonthTotals.projection6m)}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">1 An</p>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{formatCurrency(currentMonthTotals.projection12m)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            Economisește mai mult în luna curentă pentru a vedea proiecții.
          </div>
        )}
      </div>

      {/* Recent Transactions Mini */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 dark:text-white">Recent</h3>
          <Link to="/transactions" className="text-blue-600 dark:text-blue-400 text-sm font-medium">Vezi tot</Link>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 3).map(t => {
            const categoryObj = CATEGORIES.find(c => c.id === t.category);
            const iconKey = categoryObj ? categoryObj.icon : t.category;
            const categoryLabel = categoryObj ? categoryObj.label : t.category;
           
            let amountClass = 'text-gray-800 dark:text-gray-200';
            let bgClass = 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300';
            let sign = '-';
            if (t.type === 'income') {
              amountClass = 'text-green-600 dark:text-green-400';
              bgClass = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
              sign = '+';
            } else if (t.type === 'expense') {
              amountClass = 'text-gray-800 dark:text-gray-200';
              bgClass = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
              sign = '-';
            } else if (t.type === 'savings') {
              amountClass = 'text-purple-600 dark:text-purple-400';
              bgClass = 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
              sign = '';
            }
            return (
              <div key={t.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${bgClass}`}>
                    {ICON_MAP[iconKey] || <Circle size={20}/>}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{categoryLabel}</p>
                  </div>
                </div>
                <span className={`font-bold ${amountClass}`}>
                  {sign}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}