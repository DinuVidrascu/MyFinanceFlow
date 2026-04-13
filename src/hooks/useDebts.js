import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';

export function useDebts(user, confirmAction) {
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: '', total: '', remaining: '', monthlyPayment: '' });

  const resetDebtForm = () => setNewDebt({ name: '', total: '', remaining: '', monthlyPayment: '' });

  const handleSaveDebt = async () => {
    if (!user || !newDebt.name) return;
    const { id, ...cleanDebt } = newDebt;
    const data = {
      ...cleanDebt,
      total: Number(newDebt.total),
      remaining: Number(newDebt.remaining || newDebt.total),
      monthlyPayment: Number(newDebt.monthlyPayment || 0),
    };
    if (editingDebtId) {
      await setDoc(doc(db, 'users', user.uid, 'debts', editingDebtId), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'debts'), data);
    }
    setEditingDebtId(null);
    resetDebtForm();
    return true;
  };

  const handleDeleteDebt = (id) => {
    confirmAction('Ești sigur(ă) că vrei să ștergi datoria?', async () => {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'debts', id));
      } catch (e) {
        alert(e.message);
      }
    });
  };

  const startEditDebt = (d) => {
    setEditingDebtId(d.id);
    setNewDebt(d);
  };

  return {
    editingDebtId, setEditingDebtId,
    newDebt, setNewDebt,
    resetDebtForm,
    handleSaveDebt,
    handleDeleteDebt,
    startEditDebt,
  };
}
