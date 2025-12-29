import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase/config';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';

import { CATEGORIES } from './constants/categories';
import { ICON_MAP } from './constants/icons';
import { formatCurrency } from './utils/helpers';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  // Date sincronizate
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [noteGroups, setNoteGroups] = useState([]);

  // UI State (exact ca înainte)
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

  // Verifică autentificarea și aprobarea
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        const profileRef = doc(db, 'users', u.uid, 'profile', 'settings');
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists() && profileSnap.data().approved === true) {
          setApproved(true);
        } else {
          // Creează profilul dacă nu există (ca să poți vedea cererea în Firebase)
          await setDoc(profileRef, { 
            email: u.email, 
            displayName: u.displayName || u.email, 
            approved: false,
            requestedAt: new Date().toISOString()
          }, { merge: true });
          setApproved(false);
        }
        setCheckingApproval(false);
      } else {
        setCheckingApproval(false);
      }
    });
    return unsub;
  }, []);

  // Încarcă datele DOAR dacă utilizatorul este aprobat
  useEffect(() => {
    if (!user || !approved) {
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
  }, [user, approved]);

  // Calcule (identice cu originalul)
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

  // Handlere Firebase (identice cu ce aveai)
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

  // Funcții auxiliare (identice)
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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert('Eroare autentificare: ' + err.message);
    }
  };

  if (loading || checkingApproval) {
    return <div className="flex h-screen items-center justify-center text-xl">Se verifică accesul...</div>;
  }

  // Ecran login Google
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <Wallet size={60} className="mx-auto mb-6 text-blue-600" />
          <h2 className="text-2xl font-bold mb-8">FinanceFlow</h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66v-2.77h-3.57c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Autentificare cu Google
          </button>
        </div>
      </div>
    );
  }

  // Ecran „Așteaptă aprobare” – aplicația NU apare
  if (!approved) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Wallet size={80} className="mx-auto mb-8 text-blue-600" />
          <h2 className="text-2xl font-bold mb-6">Acces în așteptare</h2>
          <p className="text-gray-600 mb-4">
            Contul tău ({user.email}) a fost creat cu succes.
          </p>
          <p className="text-gray-600 mb-8">
            Așteaptă aprobarea administratorului pentru a accesa aplicația FinanceFlow.
          </p>
          <button
            onClick={() => auth.signOut()}
            className="text-sm text-gray-500 underline"
          >
            Deconectare
          </button>
        </div>
      </div>
    );
  }

  // === APLICAȚIA COMPLETĂ – apare doar după aprobare ===
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