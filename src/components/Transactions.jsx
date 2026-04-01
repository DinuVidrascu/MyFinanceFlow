import React from 'react';
import { Plus, Edit2, Trash2, Circle } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Transactions({ 
  transactions, 
  openAddModal, 
  handleEditClick, 
  handleDeleteTransaction, 
  formatCurrency, 
  ICON_MAP, 
  CATEGORIES 
}) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense - totalSavings;

  const chartData = [
    { name: 'Venituri', value: totalIncome, color: '#3b82f6' }, // blue
    { name: 'Cheltuieli', value: totalExpense, color: '#ef4444' }, // red
    { name: 'Balanță', value: balance, color: '#22c55e' } // green
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-100 dark:border-slate-700 shadow-xl">
          <p className="text-xs font-bold text-gray-800 dark:text-white capitalize">{payload[0].payload.name}</p>
          <p className="text-sm font-black" style={{ color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-20 tab-animate">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold dark:text-white">Toate Tranzacțiile</h2>
        <button onClick={openAddModal} className="bg-blue-600 text-white p-2 rounded-lg flex items-center gap-1 shadow-md hover:bg-blue-700">
          <Plus size={18} /> <span className="text-sm font-medium">Adaugă</span>
        </button>
      </div>

      {/* Grafic Circular Compact */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 flex items-center gap-6">
          <div className="h-28 w-28 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-2">
            {chartData.map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
     
      {transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>Nu există tranzacții înregistrate.</p>
        </div>
      ) : (
        transactions.map(t => {
          const categoryObj = CATEGORIES.find(c => c.id === t.category);
          const iconKey = categoryObj ? categoryObj.icon : t.category;
         
          let amountClass = 'text-gray-800 dark:text-gray-200';
          let bgClass = 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300';
          let sign = '-';
          if (t.type === 'income') {
            amountClass = 'text-green-600 dark:text-green-400';
            bgClass = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            sign = '+';
          } else if (t.type === 'expense') {
            bgClass = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
          } else if (t.type === 'savings') {
            amountClass = 'text-purple-600 dark:text-purple-400';
            bgClass = 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            sign = '';
          }
          return (
            <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between group transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${bgClass}`}>
                  {ICON_MAP[iconKey] || <Circle size={20}/>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{t.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.date).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${amountClass}`}>
                  {sign}{formatCurrency(t.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditClick(t)} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-slate-700">
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