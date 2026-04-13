import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const CustomBarTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl">
        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-black" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics({ transactions, formatCurrency, CATEGORIES, ICON_MAP }) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentMonth = useMemo(() => transactions.filter(t => t.date?.startsWith(currentKey)), [transactions, currentKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prevMonth = useMemo(() => transactions.filter(t => t.date?.startsWith(prevKey)), [transactions, prevKey]);

  const sum = (arr, type) => arr.filter(t => t.type === type).reduce((a, b) => a + Number(b.amount), 0);

  const curIncome = sum(currentMonth, 'income');
  const curExpense = sum(currentMonth, 'expense');
  const prevIncome = sum(prevMonth, 'income');
  const prevExpense = sum(prevMonth, 'expense');

  const pctChange = (cur, prev) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const incomePct = pctChange(curIncome, prevIncome);
  const expensePct = pctChange(curExpense, prevExpense);

  // Top categorii cheltuieli luna curentă
  const topCategories = useMemo(() => {
    const map = {};
    currentMonth.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([id, total]) => {
        const cat = CATEGORIES.find(c => c.id === id);
        return { id, label: cat?.label || id, total, color: cat?.color || '#6366f1' };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [currentMonth, CATEGORIES]);

  // Date pentru graficul lunar (ultimele 6 luni)
  const monthlyData = useMemo(() => {
    const [cYear, cMonth] = currentKey.split('-').map(Number);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cYear, cMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('ro-RO', { month: 'short' });
      const monthTrans = transactions.filter(t => t.date?.startsWith(key));
      months.push({
        luna: label,
        Venituri: sum(monthTrans, 'income'),
        Cheltuieli: sum(monthTrans, 'expense'),
      });
    }
    return months;
  }, [transactions, currentKey]);

  const StatCard = ({ label, cur, prev, pct, color, icon: Icon }) => {
    const up = pct >= 0;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl`} style={{ backgroundColor: color + '20', color }}>
            <Icon size={18} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            pct === 0 ? 'bg-gray-100 dark:bg-slate-700 text-gray-500' :
            up ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {pct === 0 ? <Minus size={12} /> : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(pct)}%
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-black text-gray-800 dark:text-white">{formatCurrency(cur)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Luna trecută: {formatCurrency(prev)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 tab-animate">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <BarChart2 size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Statistici & Analytics</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Comparație cu luna anterioară</p>
        </div>
      </div>

      {/* Carduri comparatie */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Venituri luna curentă" cur={curIncome} prev={prevIncome} pct={incomePct} color="#22c55e" icon={TrendingUp} />
        <StatCard label="Cheltuieli luna curentă" cur={curExpense} prev={prevExpense} pct={expensePct} color="#ef4444" icon={TrendingDown} />
      </div>

      {/* Mesaj comparatie */}
      {prevExpense > 0 && (
        <div className={`p-4 rounded-2xl border ${
          expensePct < 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/40'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/40'
        }`}>
          <p className={`text-sm font-semibold ${expensePct < 0 ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
            {expensePct < 0
              ? `🎉 Luna asta ai cheltuit cu ${Math.abs(expensePct)}% mai puțin ca luna trecută!`
              : `⚠️ Luna asta ai cheltuit cu ${expensePct}% mai mult ca luna trecută.`
            }
          </p>
        </div>
      )}

      {/* Grafic evolutie 6 luni */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm">Evoluție 6 Luni</h3>
        {monthlyData.every(m => m.Venituri === 0 && m.Cheltuieli === 0) ? (
          <p className="text-center text-sm text-gray-400 py-6">Nu există date suficiente.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="luna" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={55} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomBarTooltip formatCurrency={formatCurrency} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Venituri" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Cheltuieli" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top categorii cheltuieli */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm">
          Top Cheltuieli — Luna Curentă
        </h3>
        {topCategories.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Nicio cheltuială înregistrată luna aceasta.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCategories} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={75} />
                <Tooltip content={<CustomBarTooltip formatCurrency={formatCurrency} />} />
                <Bar dataKey="total" name="Suma" radius={[0, 6, 6, 0]}>
                  {topCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || ['#6366f1','#f59e0b','#ef4444','#22c55e','#3b82f6','#ec4899'][index % 6]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {topCategories.map((cat, i) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || ['#6366f1','#f59e0b','#ef4444','#22c55e','#3b82f6','#ec4899'][i % 6] }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{cat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
