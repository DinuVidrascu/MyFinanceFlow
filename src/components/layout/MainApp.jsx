import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { db } from '../../firebase/config'; 
import { collection, addDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Utils & Constants
import { CATEGORIES } from '../../constants/categories';
import { ICON_MAP } from '../../constants/icons';
import { formatCurrency } from '../../utils/helpers';
import { useFinanceData } from '../../hooks/useFinanceData';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useDarkMode } from '../../hooks/useDarkMode';
import { WifiOff, Wallet, Plus, RotateCcw, Home, List, CreditCard, ClipboardList, Calendar, Bell, Moon, Sun } from 'lucide-react';

// Components
import Dashboard from '../../pages/Dashboard';
import Transactions from '../../pages/Transactions';
import Debts from '../../pages/Debts';
import Notes from '../../pages/Notes';
import TabButton from '../common/TabButton';

// Modals
import AddTransactionModal from '../modals/AddTransactionModal';
import AddDebtModal from '../modals/AddDebtModal';
import AddNoteModal from '../modals/AddNoteModal';
import ImportModal from '../modals/ImportModal';
import HistoryModal from '../modals/HistoryModal';



const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 15 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -15 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function MainApp({ user, approved }) {
  const location = useLocation();
  const { transactions, debts, noteGroups } = useFinanceData(user, approved);
  const isOnline = useNetworkStatus();
  const { permission, requestPermission } = usePushNotifications();
  const [isDark, setIsDark] = useDarkMode();


  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewHistoryMonth, setViewHistoryMonth] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importConfig, setImportConfig] = useState({ target: '', source: '' });

  const [editingId, setEditingId] = useState(null);
  const [newTrans, setNewTrans] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: '' });
  
  const resetTransForm = () => setNewTrans({ type: 'expense', amount: '', category: 'food', description: '', date: '' });

  const [editingDebtId, setEditingDebtId] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: '', total: '', remaining: '', monthlyPayment: '' });
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({ id: null, title: '', items: [] });

  // --- LOGICA DE CALCUL ACTUALIZATĂ (ROLLOVER) ---
  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((a, b) => a + Number(b.amount), 0);
    const realBalance = totalIncome - totalExpense - totalSavings;

    const currentTrans = transactions.filter(t => t.date.startsWith(currentKey));
    const monthIncome = currentTrans.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const monthExpense = currentTrans.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const monthSavings = currentTrans.filter(t => t.type === 'savings').reduce((a, b) => a + Number(b.amount), 0);

    return { 
      income: monthIncome, 
      expense: monthExpense, 
      savings: monthSavings, 
      balance: realBalance, 
      projection6m: monthSavings * 6, 
      projection12m: monthSavings * 12 
    };
  }, [transactions]);

  const notesTotalImpact = useMemo(() => {
    return noteGroups.reduce((acc, g) => 
      acc + (g.items || []).filter(i => !i.checked).reduce((s, i) => s + Number(i.cost || 0), 0), 0
    );
  }, [noteGroups]);

  const historyGroups = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = { id: key, label: d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }), income: 0, expense: 0, savings: 0, count: 0 };
      groups[key][t.type] += Number(t.amount);
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.id.localeCompare(a.id));
  }, [transactions]);

  // --- HANDLERS ---
  const handleSaveTransaction = async () => {
    if (!user || !newTrans.amount) return;
    const { id, ...cleanTrans } = newTrans;
    const data = { ...cleanTrans, amount: Number(newTrans.amount), date: newTrans.date || new Date().toISOString() };
    if (editingId) {
      await setDoc(doc(db, 'users', user.uid, 'transactions', editingId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
    }
    setShowAddModal(false);
    setEditingId(null);
    resetTransForm();
  };

  const handleDeleteTransaction = async (id) => {
    if (!user) return;
    const item = transactions.find(t => t.id === id);
    setUndoItem(item);
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
    setTimeout(() => setUndoItem(null), 5000);
  };

  const handleUndo = async () => {
    if (undoItem && user) {
      const { id, ...data } = undoItem;
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
      setUndoItem(null);
    }
  };

  const handleSaveDebt = async () => {
    if (!user || !newDebt.name) return;
    const data = { ...newDebt, total: Number(newDebt.total), remaining: Number(newDebt.remaining || newDebt.total), monthlyPayment: Number(newDebt.monthlyPayment || 0) };
    if (editingDebtId) {
      await setDoc(doc(db, 'users', user.uid, 'debts', editingDebtId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'debts'), data);
    }
    setShowDebtModal(false);
    setEditingDebtId(null);
  };

  const handleSaveNoteGroup = async () => {
    if (!user || !currentGroup.title.trim()) return;
    const data = {
      title: currentGroup.title.trim(),
      items: (currentGroup.items || []).filter(i => i.text.trim()).map(i => ({ 
        id: i.id || crypto.randomUUID(), 
        text: i.text.trim(), 
        cost: Number(i.cost || 0), 
        checked: i.checked || false 
      })),
      updatedAt: new Date().toISOString()
    };
    if (currentGroup.id) {
      await setDoc(doc(db, 'users', user.uid, 'noteGroups', currentGroup.id), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'noteGroups'), data);
    }
    setShowNoteModal(false);
  };

  const toggleSubItemCheck = async (groupId, itemId) => {
    const group = noteGroups.find(g => g.id === groupId);
    const updated = group.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    await updateDoc(doc(db, 'users', user.uid, 'noteGroups', groupId), { items: updated });
  };

  const handleImportMonth = async () => {
    if (!user || !importConfig.target || !importConfig.source) return;
    const sourceTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === importConfig.source;
    });

    for (const t of sourceTrans) {
      const d = new Date(t.date);
      const [y, m] = importConfig.target.split('-');
      const newD = new Date(y, m - 1, d.getDate());
      const { id, ...data } = t;
      await addDoc(collection(db, 'users', user.uid, 'transactions'), { ...data, date: newD.toISOString() });
    }
    setShowImportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 pb-24 relative transition-colors duration-300">
      {!isOnline && (
        <div className="bg-orange-500 text-white text-xs font-bold py-2 px-4 flex justify-center items-center gap-2 shadow-sm animate-fade-in z-50 sticky top-0">
          <WifiOff size={16} /> Mod Offline - Sincronizare la reconectare
        </div>
      )}
      <header className={`bg-white dark:bg-slate-800 p-6 shadow-sm sticky ${isOnline ? 'top-0' : 'top-[32px]'} z-20 flex justify-between items-center transition-all duration-300`}>
        <div><h1 className="font-black text-xl flex items-center gap-2 text-gray-800 dark:text-white"><Wallet className="text-blue-600 dark:text-blue-400" /> FinanceFlow</h1></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {permission !== 'granted' && isOnline && (
            <button onClick={requestPermission} className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-800/50 flex items-center shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition">
              <Bell size={20} className="animate-pulse" />
            </button>
          )}
          <button onClick={() => setShowHistoryModal(true)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"><Calendar size={20} /></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 w-full relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Dashboard currentMonthTotals={currentMonthTotals} transactions={transactions} formatCurrency={formatCurrency} ICON_MAP={ICON_MAP} CATEGORIES={CATEGORIES} /></PageWrapper>} />
            <Route path="/transactions" element={<PageWrapper><Transactions transactions={transactions} openAddModal={() => { resetTransForm(); setEditingId(null); setShowAddModal(true); }} handleEditClick={(t) => { setNewTrans({...t, date: new Date(t.date).toISOString().split('T')[0]}); setEditingId(t.id); setShowAddModal(true); }} handleDeleteTransaction={handleDeleteTransaction} formatCurrency={formatCurrency} ICON_MAP={ICON_MAP} CATEGORIES={CATEGORIES} /></PageWrapper>} />
            <Route path="/debts" element={<PageWrapper><Debts debts={debts} openDebtModal={() => setShowDebtModal(true)} handleEditDebt={(d) => { setEditingDebtId(d.id); setNewDebt(d); setShowDebtModal(true); }} handleDeleteDebt={(id) => { if (window.confirm("Ștergi datoria?")) deleteDoc(doc(db, 'users', user.uid, 'debts', id)); }} formatCurrency={formatCurrency} /></PageWrapper>} />
            <Route path="/notes" element={<PageWrapper><Notes noteGroups={noteGroups} openNoteGroupModal={(g = null) => { setCurrentGroup(g ? {...g} : {id:null, title:'', items:[{id:crypto.randomUUID(), text:'', cost:'', checked:false}]}); setShowNoteModal(true); }} handleDeleteGroup={(id) => { if (id && window.confirm("Ștergi această listă?")) deleteDoc(doc(db, 'users', user.uid, 'noteGroups', id)); }} toggleSubItemCheck={toggleSubItemCheck} getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)} notesTotalImpact={notesTotalImpact} formatCurrency={formatCurrency} /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Modale */}
      <AddTransactionModal showAddModal={showAddModal} setShowAddModal={setShowAddModal} newTrans={newTrans} setNewTrans={setNewTrans} editingId={editingId} handleSaveTransaction={handleSaveTransaction} />
      <AddDebtModal showDebtModal={showDebtModal} setShowDebtModal={setShowDebtModal} newDebt={newDebt} setNewDebt={setNewDebt} editingDebtId={editingDebtId} handleSaveDebt={handleSaveDebt} />
      <AddNoteModal showNoteModal={showNoteModal} setShowNoteModal={setShowNoteModal} currentGroup={currentGroup} setCurrentGroup={setCurrentGroup} handleAddSubItem={() => setCurrentGroup({...currentGroup, items: [...currentGroup.items, { id: crypto.randomUUID(), text: '', cost: '', checked: false }]})} handleRemoveSubItem={(id) => setCurrentGroup({...currentGroup, items: currentGroup.items.filter(i => i.id !== id)})} handleSubItemChange={(id, f, v) => setCurrentGroup({...currentGroup, items: currentGroup.items.map(i => i.id === id ? {...i, [f]: v} : i)})} handleSaveNoteGroup={handleSaveNoteGroup} getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)} formatCurrency={formatCurrency} />
      <ImportModal showImportModal={showImportModal} setShowImportModal={setShowImportModal} importConfig={importConfig} setImportConfig={setImportConfig} handleImportMonth={handleImportMonth} historyGroups={historyGroups} />
      
      <HistoryModal 
        showHistoryModal={showHistoryModal} setShowHistoryModal={setShowHistoryModal} 
        viewHistoryMonth={viewHistoryMonth} setViewHistoryMonth={setViewHistoryMonth} 
        historyGroups={historyGroups} transactions={transactions} 
        setShowImportModal={setShowImportModal} formatCurrency={formatCurrency}
        handleDeleteTransaction={handleDeleteTransaction}
        handleEditClick={(t) => { setNewTrans({...t, date: new Date(t.date).toISOString().split('T')[0]}); setEditingId(t.id); setShowAddModal(true); }}
        openAddModalForMonth={(monthKey) => { resetTransForm(); setNewTrans(prev => ({ ...prev, date: `${monthKey}-01` })); setEditingId(null); setShowAddModal(true); }}
      />

      {/* Undo Toast */}
      {undoItem && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 w-[90%] max-w-sm justify-between transition-all">
          <span className="text-sm">Tranzacție ștearsă</span>
          <button onClick={handleUndo} className="flex items-center gap-1 text-blue-300 font-bold hover:text-white"><RotateCcw size={16} /> UNDO</button>
        </div>
      )}

      {/* Navigare Inferioară */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/50 p-4 flex justify-around items-center h-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] transition-colors duration-300 z-30">
        <TabButton to="/" icon={Home} label="Acasă" />
        <TabButton to="/transactions" icon={List} label="Tranzacții" />
        <div className="w-12"></div>
        <TabButton to="/debts" icon={CreditCard} label="Datorii" />
        <TabButton to="/notes" icon={ClipboardList} label="Notițe" />
        <button aria-label="Adaugă tranzacție nouă" onClick={() => { resetTransForm(); setEditingId(null); setShowAddModal(true); }} className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 dark:border-slate-900 hover:scale-110 transition-transform"><Plus size={28} /></button>
      </nav>
    </div>
  );
}
