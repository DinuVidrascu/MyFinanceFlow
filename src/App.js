import React, { useState, useMemo } from 'react';
import { db, auth } from './firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  collection, addDoc, doc, setDoc, deleteDoc, updateDoc
} from 'firebase/firestore';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useFinanceData } from './hooks/useFinanceData';

// Utils & Constants
import { CATEGORIES } from './constants/categories';
import { ICON_MAP } from './constants/icons';
import { formatCurrency } from './utils/helpers';

// Components
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Notes from './components/Notes';
import TabButton from './components/common/TabButton';

// Modals
import AddTransactionModal from './components/modals/AddTransactionModal';
import AddDebtModal from './components/modals/AddDebtModal';
import AddNoteModal from './components/modals/AddNoteModal';
import ImportModal from './components/modals/ImportModal';
import HistoryModal from './components/modals/HistoryModal';

// Icons
import { Wallet, Plus, RotateCcw, Home, List, CreditCard, ClipboardList, Calendar } from 'lucide-react';

export default function App() {
  const { user, loading, approved, checkingApproval } = useAuth();
  const { transactions, debts, noteGroups } = useFinanceData(user, approved);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewHistoryMonth, setViewHistoryMonth] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importConfig, setImportConfig] = useState({ target: '', source: '' });

  const [editingId, setEditingId] = useState(null);
  const [newTrans, setNewTrans] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: '' });
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: '', total: '', remaining: '', monthlyPayment: '' });
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({ id: null, title: '', items: [] });

  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentTrans = transactions.filter(t => t.date.startsWith(currentKey));
    const income = currentTrans.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = currentTrans.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const savings = currentTrans.filter(t => t.type === 'savings').reduce((a, b) => a + Number(b.amount), 0);
    const balance = income - expense - savings;
    return { income, expense, savings, balance, projection6m: balance * 6, projection12m: balance * 12 };
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

  const handleSaveTransaction = async () => {
    if (!user || !newTrans.amount) return;
    const data = { ...newTrans, amount: Number(newTrans.amount), date: newTrans.date || new Date().toISOString() };
    if (editingId) {
      await setDoc(doc(db, 'users', user.uid, 'transactions', editingId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
    }
    setShowAddModal(false);
    setEditingId(null);
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

  const handleDeleteDebt = async (id) => {
    if (window.confirm("Ștergi datoria?")) await deleteDoc(doc(db, 'users', user.uid, 'debts', id));
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

  const handleDeleteGroup = async (id) => {
    if (id && window.confirm("Ștergi această listă?")) {
      await deleteDoc(doc(db, 'users', user.uid, 'noteGroups', id));
    }
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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Eroare la logare: " + err.message);
    }
  };

  if (loading || checkingApproval)
    return <div className="h-screen flex items-center justify-center font-bold">Se încarcă FinanceFlow...</div>;

  if (!user) return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
        <Wallet size={64} className="mx-auto text-blue-600 mb-6" />
        <h2 className="text-2xl font-black mb-8">FinanceFlow</h2>
        <button onClick={handleGoogleLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">Loghează-te cu Google</button>
      </div>
    </div>
  );

  if (!approved) return <div className="h-screen flex items-center justify-center text-center p-8">Așteaptă aprobarea pentru {user.email}.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-24 relative">
      <header className="bg-white p-6 shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div><h1 className="font-black text-xl flex items-center gap-2">
          <Wallet  className="text-blue-600" /> FinanceFlow</h1></div>
        <button onClick={() => setShowHistoryModal(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><Calendar size={22} /></button>
      </header>

      <main className="max-w-md mx-auto p-4">
        {activeTab === 'dashboard' && 
        <Dashboard
          currentMonthTotals={currentMonthTotals}
          transactions={transactions}
          setActiveTab={setActiveTab}
          formatCurrency={formatCurrency}
          ICON_MAP={ICON_MAP}
          CATEGORIES={CATEGORIES} />}
        {activeTab === 'transactions' && <Transactions
          transactions={transactions}
          openAddModal={() => { setEditingId(null); setShowAddModal(true); }}
          handleEditClick={(t) => { setNewTrans({ ...t, date: new Date(t.date).toISOString().split('T')[0] }); setEditingId(t.id); setShowAddModal(true); }}
          handleDeleteTransaction={handleDeleteTransaction}
          formatCurrency={formatCurrency}
          ICON_MAP={ICON_MAP}
          CATEGORIES={CATEGORIES} />}
        {activeTab === 'debts' && <Debts
          debts={debts}
          openDebtModal={() => setShowDebtModal(true)}
          handleEditDebt={(d) => { setEditingDebtId(d.id); setNewDebt(d); setShowDebtModal(true); }}
          handleDeleteDebt={handleDeleteDebt}
          formatCurrency={formatCurrency}
        />}

        {activeTab === 'notes' && <Notes
          noteGroups={noteGroups}
          openNoteGroupModal={(g = null) => { setCurrentGroup(g ? { ...g } : { id: null, title: '', items: [{ id: crypto.randomUUID(), text: '', cost: '', checked: false }] }); setShowNoteModal(true); }}
          handleDeleteGroup={handleDeleteGroup}
          toggleSubItemCheck={toggleSubItemCheck}
          getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)}
          notesTotalImpact={notesTotalImpact}
          formatCurrency={formatCurrency}
        />}

      </main>

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
        handleAddSubItem={() => setCurrentGroup({ ...currentGroup, items: [...currentGroup.items, { id: crypto.randomUUID(), text: '', cost: '', checked: false }] })}
        handleRemoveSubItem={(id) => setCurrentGroup({ ...currentGroup, items: currentGroup.items.filter(i => i.id !== id) })} handleSubItemChange={(id, f, v) => setCurrentGroup({ ...currentGroup, items: currentGroup.items.map(i => i.id === id ? { ...i, [f]: v } : i) })}
        handleSaveNoteGroup={handleSaveNoteGroup}
        getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)}
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
        setShowImportModal={setShowImportModal}
        formatCurrency={formatCurrency}
        handleDeleteTransaction={handleDeleteTransaction}
        handleEditClick={(t) => { setNewTrans({ ...t, date: new Date(t.date).toISOString().split('T')[0] }); setEditingId(t.id); setShowAddModal(true); }}
        openAddModalForMonth={(monthKey) => { setNewTrans({ ...newTrans, date: `${monthKey}-01` }); setEditingId(null); setShowAddModal(true); }}
      />

      {undoItem && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2
         bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl 
         flex items-center gap-4 z-50 w-[90%] max-w-sm justify-between transition-all">
          <span className="text-sm">Tranzacție ștearsă</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-blue-300 
          font-bold hover:text-white">
            <RotateCcw size={16} /> UNDO
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 w-full bg-white border-t
       border-gray-100 p-4 flex justify-around items-center h-20 shadow-lg z-30">
        <TabButton id="dashboard" icon={Home} label="Acasă"
          activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="transactions" icon={List} label="Tranzacții"
          activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="w-12"></div>
        <TabButton id="debts" icon={CreditCard} label="Datorii"
          activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="notes" icon={ClipboardList} label="Notițe"
          activeTab={activeTab} setActiveTab={setActiveTab} />
        <button onClick={() => { setEditingId(null); setShowAddModal(true); }} className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-blue-600 text-white p-4 rounded-full 
        shadow-xl border-4 border-gray-50 hover:scale-110 transition">
          <Plus size={28} />
        </button>
      </nav>
    </div>
  );
}