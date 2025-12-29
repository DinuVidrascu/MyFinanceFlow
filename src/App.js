import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

import { CATEGORIES } from './constants/categories';
import { ICON_MAP } from './constants/icons';
import { formatCurrency, getLastMonthDate } from './utils/helpers';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Notes from './components/Notes';
import TabButton from './components/common/TabButton';

import AddTransactionModal from './components/modals/AddTransactionModal';
import AddDebtModal from './components/modals/AddDebtModal';
import AddNoteModal from './components/modals/AddNoteModal';
import ImportModal from './components/modals/ImportModal';
import HistoryModal from './components/modals/HistoryModal';

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Trash2,
  RotateCcw,
  Circle,
  Home,
  List,
  CreditCard,
  ClipboardList,
  Calendar,
  X,
  ArrowLeft,
  CopyPlus
} from 'lucide-react';

export default function App() {
  // --- Autentificare ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // --- Date sincronizate cu Firebase ---
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [noteGroups, setNoteGroups] = useState([]);

  // --- UI State (exact ca în codul original) ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewHistoryMonth, setViewHistoryMonth] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importConfig, setImportConfig] = useState({ target: '', source: '' });
  const [editingId, setEditingId] = useState(null);
  const [newTrans, setNewTrans] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: '' });
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: '', total: '', remaining: '', monthlyPayment: '' });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({ id: null, title: '', items: [] });

  // --- Autentificare ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) setShowLogin(true);
    });
    return unsub;
  }, []);

  // --- Sincronizare real-time cu Firestore ---
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setDebts([]);
      setNoteGroups([]);
      return;
    }

    const transUnsub = onSnapshot(collection(db, 'users', user.uid, 'transactions'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    const debtsUnsub = onSnapshot(collection(db, 'users', user.uid, 'debts'), (snap) => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const notesUnsub = onSnapshot(collection(db, 'users', user.uid, 'noteGroups'), (snap) => {
      setNoteGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      transUnsub();
      debtsUnsub();
      notesUnsub();
    };
  }, [user]);

  // --- Calcule (identice cu originalul) ---
  const historyGroups = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          label: date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }),
          income: 0,
          expense: 0,
          savings: 0,
          count: 0
        };
      }
      if (t.type === 'income') groups[key].income += Number(t.amount);
      else if (t.type === 'expense') groups[key].expense += Number(t.amount);
      else if (t.type === 'savings') groups[key].savings += Number(t.amount);
      groups[key].count += 1;
    });
    return Object.values(groups).sort((a, b) => b.id.localeCompare(a.id));
  }, [transactions]);

  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentKey;
    });
    const income = currentTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = currentTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const savings = currentTransactions.filter(t => t.type === 'savings').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = income - expense - savings;
    const projection6m = balance * 6;
    const projection12m = balance * 12;
    return { income, expense, savings, balance, projection6m, projection12m };
  }, [transactions]);

  const notesTotalImpact = useMemo(() => {
    return noteGroups.reduce((acc, group) => {
      return acc + group.items
        .filter(i => !i.checked)
        .reduce((sum, i) => sum + Number(i.cost || 0), 0);
    }, 0);
  }, [noteGroups]);

  // --- Handlere pentru Firebase ---
  const handleSaveTransaction = async () => {
    if (!user || !newTrans.amount || !newTrans.description) return;
    const date = newTrans.date ? new Date(newTrans.date).toISOString() : new Date().toISOString();
    const data = { ...newTrans, amount: Number(newTrans.amount), date };

    if (editingId) {
      await setDoc(doc(db, 'users', user.uid, 'transactions', editingId), data);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
    }
    setShowAddModal(false);
    setNewTrans({ type: 'expense', amount: '', category: 'food', description: '', date: '' });
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
      await addDoc(collection(db, 'users', user.uid, 'transactions'), undoItem);
      setUndoItem(null);
    }
  };

  const handleSaveDebt = async () => {
    if (!user || !newDebt.name || !newDebt.total) return;
    const data = {
      ...newDebt,
      total: Number(newDebt.total),
      remaining: Number(newDebt.remaining || newDebt.total),
      monthlyPayment: Number(newDebt.monthlyPayment || 0)
    };
    if (editingDebtId) {
      await setDoc(doc(db, 'users', user.uid, 'debts', editingDebtId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'debts'), data);
    }
    setShowDebtModal(false);
    setEditingDebtId(null);
    setNewDebt({ name: '', total: '', remaining: '', monthlyPayment: '' });
  };

  const handleDeleteDebt = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'debts', id));
  };

  const handleSaveNoteGroup = async () => {
    if (!user || !currentGroup.title) return;
    const cleanItems = currentGroup.items
      .filter(i => i.text.trim() !== '')
      .map(i => ({ ...i, cost: Number(i.cost || 0) }));
    const data = { ...currentGroup, items: cleanItems };

    if (currentGroup.id) {
      await setDoc(doc(db, 'users', user.uid, 'noteGroups', currentGroup.id), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'noteGroups'), data);
    }
    setShowNoteModal(false);
  };

  const handleDeleteGroup = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'noteGroups', id));
  };

  const toggleSubItemCheck = async (groupId, itemId) => {
    if (!user) return;
    const group = noteGroups.find(g => g.id === groupId);
    const updatedItems = group.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    await setDoc(doc(db, 'users', user.uid, 'noteGroups', groupId), { items: updatedItems });
  };

  const getGroupTotal = (items) => items.reduce((acc, item) => acc + (Number(item.cost) || 0), 0);

  // --- Funcții auxiliare (identice) ---
  const handleEditClick = (transaction) => {
    const dateStr = new Date(transaction.date).toISOString().split('T')[0];
    setNewTrans({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: dateStr
    });
    setEditingId(transaction.id);
    setShowAddModal(true);
  };

  const openAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setNewTrans({ type: 'expense', amount: '', category: 'food', description: '', date: today });
    setEditingId(null);
    setShowAddModal(true);
  };

  const openAddModalForMonth = (monthKey) => {
    setNewTrans({ type: 'expense', amount: '', category: 'food', description: '', date: `${monthKey}-01` });
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleEditDebt = (debt) => {
    setNewDebt(debt);
    setEditingDebtId(debt.id);
    setShowDebtModal(true);
  };

  const openDebtModal = () => {
    setNewDebt({ name: '', total: '', remaining: '', monthlyPayment: '' });
    setEditingDebtId(null);
    setShowDebtModal(true);
  };

  const openNoteGroupModal = (group = null) => {
    if (group) {
      setCurrentGroup(JSON.parse(JSON.stringify(group)));
    } else {
      setCurrentGroup({ id: null, title: '', items: [{ id: Date.now(), text: '', cost: '', checked: false }] });
    }
    setShowNoteModal(true);
  };

  const handleAddSubItem = () => {
    setCurrentGroup({
      ...currentGroup,
      items: [...currentGroup.items, { id: Date.now(), text: '', cost: '', checked: false }]
    });
  };

  const handleRemoveSubItem = (itemId) => {
    setCurrentGroup({
      ...currentGroup,
      items: currentGroup.items.filter(i => i.id !== itemId)
    });
  };

  const handleSubItemChange = (itemId, field, value) => {
    setCurrentGroup({
      ...currentGroup,
      items: currentGroup.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
    });
  };

  const handleImportMonth = async () => {
    if (!user || !importConfig.target) return;
    // Logica de import rămâne locală (copiază tranzacții și le adaugă în Firestore)
    let newTransactions = [];
    if (importConfig.source) {
      const sourceTrans = transactions.filter(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === importConfig.source;
      });
      newTransactions = sourceTrans.map(t => {
        const originalDate = new Date(t.date);
        const day = originalDate.getDate();
        const [year, month] = importConfig.target.split('-');
        const newDate = new Date(year, month - 1, day);
        if (newDate.getMonth() !== month - 1) newDate.setDate(0);
        return { ...t, date: newDate.toISOString() };
      });
    }
    for (const t of newTransactions) {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), t);
    }
    setShowImportModal(false);
    setImportConfig({ target: '', source: '' });
  };

  // --- Login Handler ---
  const handleLogin = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      alert('Eroare: ' + err.message);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-xl">Se încarcă...</div>;
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <Wallet size={60} className="mx-auto mb-6 text-blue-600" />
          <h2 className="text-2xl font-bold mb-8">FinanceFlow</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {isRegister ? 'Creează cont' : 'Autentificare'}
          </button>
          <p className="mt-6 text-sm text-gray-600">
            {isRegister ? 'Ai deja cont?' : 'Nu ai cont?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 font-bold"
            >
              {isRegister ? 'Autentificare' : 'Înregistrează-te'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- UI-ul principal (exact ca în codul tău original) ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20 relative overflow-x-hidden">
      <style>{`
        html { overflow-y: scroll; }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .tab-animate { animation: slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-slide-up { animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: translate(-50%, 20px) scale(0.9); } 50% { transform: translate(-50%, -5px) scale(1.05); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Header */}
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-600" /> FinanceFlow
          </h1>
          <p className="text-xs text-gray-500">Planificare Inteligentă</p>
        </div>
        <button
          onClick={() => { setShowHistoryModal(true); setViewHistoryMonth(null); }}
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-100"
        >
          <Calendar size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentMonthTotals={currentMonthTotals}
            transactions={transactions}
            setActiveTab={setActiveTab}
            formatCurrency={formatCurrency}
            ICON_MAP={ICON_MAP}
            CATEGORIES={CATEGORIES}
          />
        )}
        {activeTab === 'transactions' && (
          <Transactions
            transactions={transactions}
            openAddModal={openAddModal}
            handleEditClick={handleEditClick}
            handleDeleteTransaction={handleDeleteTransaction}
            formatCurrency={formatCurrency}
            ICON_MAP={ICON_MAP}
            CATEGORIES={CATEGORIES}
          />
        )}
        {activeTab === 'debts' && (
          <Debts
            debts={debts}
            openDebtModal={openDebtModal}
            handleEditDebt={handleEditDebt}
            handleDeleteDebt={handleDeleteDebt}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'notes' && (
          <Notes
            noteGroups={noteGroups}
            openNoteGroupModal={openNoteGroupModal}
            handleDeleteGroup={handleDeleteGroup}
            toggleSubItemCheck={toggleSubItemCheck}
            getGroupTotal={getGroupTotal}
            notesTotalImpact={notesTotalImpact}
            formatCurrency={formatCurrency}
          />
        )}
      </main>

      {/* Toate modalele */}
      <AddTransactionModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newTrans={newTrans}
        setNewTrans={setNewTrans}
        editingId={editingId}
        handleSaveTransaction={handleSaveTransaction}
      />
      <AddDebtModal
        showDebtModal={showDebtModal}
        setShowDebtModal={setShowDebtModal}
        newDebt={newDebt}
        setNewDebt={setNewDebt}
        editingDebtId={editingDebtId}
        handleSaveDebt={handleSaveDebt}
      />
      <AddNoteModal
        showNoteModal={showNoteModal}
        setShowNoteModal={setShowNoteModal}
        currentGroup={currentGroup}
        setCurrentGroup={setCurrentGroup}
        handleAddSubItem={handleAddSubItem}
        handleRemoveSubItem={handleRemoveSubItem}
        handleSubItemChange={handleSubItemChange}
        handleSaveNoteGroup={handleSaveNoteGroup}
        getGroupTotal={getGroupTotal}
        formatCurrency={formatCurrency}
      />
      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        importConfig={importConfig}
        setImportConfig={setImportConfig}
        handleImportMonth={handleImportMonth}
        historyGroups={historyGroups}
      />
      <HistoryModal
        showHistoryModal={showHistoryModal}
        setShowHistoryModal={setShowHistoryModal}
        viewHistoryMonth={viewHistoryMonth}
        setViewHistoryMonth={setViewHistoryMonth}
        historyGroups={historyGroups}
        transactions={transactions}
        openAddModalForMonth={openAddModalForMonth}
        handleDeleteTransaction={handleDeleteTransaction}
        handleEditClick={handleEditClick}
        setShowImportModal={setShowImportModal}
        formatCurrency={formatCurrency}
      />

      {/* Undo Toast */}
      {undoItem && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-bounce-in z-50 w-[90%] max-w-sm justify-between">
          <span className="text-sm">Tranzacție ștearsă</span>
          <button onClick={handleUndo} className="flex items-center gap-1 text-blue-300 font-bold text-sm hover:text-white transition">
            <RotateCcw size={16} /> UNDO
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center z-40 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <TabButton id="dashboard" icon={Home} label="Acasă" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="transactions" icon={List} label="Tranzacții" activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="w-12"></div>
        <TabButton id="debts" icon={CreditCard} label="Datorii" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="notes" icon={ClipboardList} label="Notițe" activeTab={activeTab} setActiveTab={setActiveTab} />
        <button
          onClick={openAddModal}
          className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all border-4 border-gray-50"
        >
          <Plus size={24} />
        </button>
      </nav>
    </div>
  );
}