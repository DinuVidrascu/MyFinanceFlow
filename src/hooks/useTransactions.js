import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';

export function useTransactions(user, transactions, confirmAction) {
  const [editingId, setEditingId] = useState(null);
  const [newTrans, setNewTrans] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: '' });
  const [undoItem, setUndoItem] = useState(null);

  const resetTransForm = () => setNewTrans({ type: 'expense', amount: '', category: 'food', description: '', date: '' });

  const handleSaveTransaction = async () => {
    if (!user || !newTrans.amount) return;
    const { id, ...cleanTrans } = newTrans;
    const data = { ...cleanTrans, amount: Number(newTrans.amount), date: newTrans.date || new Date().toISOString() };
    if (editingId) {
      await setDoc(doc(db, 'users', user.uid, 'transactions', editingId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
    }
    setEditingId(null);
    resetTransForm();
    return true; // semnal că s-a salvat (pentru a închide modalul)
  };

  const handleDeleteTransaction = async (id, skipConfirm = false) => {
    if (!user) return;
    const executeDelete = async () => {
      try {
        const item = transactions.find(t => t.id === id);
        setUndoItem(item);
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
        setTimeout(() => setUndoItem(null), 5000);
      } catch (err) {
        alert('Eroare la ștergerea tranzacției: ' + err.message);
      }
    };
    if (skipConfirm) {
      await executeDelete();
    } else {
      confirmAction('Ești sigur(ă) că vrei să ștergi această tranzacție?', executeDelete);
    }
  };

  const handleUndo = async () => {
    if (undoItem && user) {
      const { id, ...data } = undoItem;
      await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
      setUndoItem(null);
    }
  };

  const handleImportMonth = async (transactions, importConfig) => {
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
  };

  const startEditTransaction = (t) => {
    setNewTrans({ ...t, date: new Date(t.date).toISOString().split('T')[0] });
    setEditingId(t.id);
  };

  return {
    editingId, setEditingId,
    newTrans, setNewTrans,
    undoItem,
    resetTransForm,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleUndo,
    handleImportMonth,
    startEditTransaction,
  };
}
