import React from 'react';
import { Home, List, CreditCard, BarChart2, Plus } from 'lucide-react';
import TabButton from '../common/TabButton';

export default function AppNav({ onAddClick }) {
  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/50 p-4 flex justify-around items-center h-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] transition-colors duration-300 z-30">
      <TabButton to="/" icon={Home} label="Acasă" />
      <TabButton to="/transactions" icon={List} label="Tranzacții" />
      <div className="w-12" />
      <TabButton to="/debts" icon={CreditCard} label="Datorii" />
      <TabButton to="/analytics" icon={BarChart2} label="Statistici" />
      <button
        aria-label="Adaugă tranzacție nouă"
        onClick={onAddClick}
        className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 dark:border-slate-900 hover:scale-110 transition-transform"
      >
        <Plus size={28} />
      </button>
    </nav>
  );
}
