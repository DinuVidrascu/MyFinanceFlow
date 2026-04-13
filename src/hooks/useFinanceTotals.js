import { useMemo } from 'react';

export function useFinanceTotals(transactions, noteGroups) {
  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((a, b) => a + Number(b.amount), 0);
    const realBalance  = totalIncome - totalExpense - totalSavings;

    const currentTrans  = transactions.filter(t => t.date?.startsWith(currentKey));
    const monthIncome   = currentTrans.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const monthExpense  = currentTrans.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const monthSavings  = currentTrans.filter(t => t.type === 'savings').reduce((a, b) => a + Number(b.amount), 0);

    return {
      income: monthIncome,
      expense: monthExpense,
      savings: monthSavings,
      balance: realBalance,
      projection6m: monthSavings * 6,
      projection12m: monthSavings * 12,
    };
  }, [transactions]);

  const historyGroups = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          label: d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }),
          income: 0, expense: 0, savings: 0, count: 0,
        };
      }
      groups[key][t.type] += Number(t.amount);
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.id.localeCompare(a.id));
  }, [transactions]);

  const notesTotalImpact = useMemo(() => {
    return noteGroups.reduce((acc, g) =>
      acc + (g.items || []).filter(i => !i.checked).reduce((s, i) => s + Number(i.cost || 0), 0), 0
    );
  }, [noteGroups]);

  return { currentMonthTotals, historyGroups, notesTotalImpact };
}
