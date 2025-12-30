import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

export function useFinanceData(user, approved) {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [noteGroups, setNoteGroups] = useState([]);

  useEffect(() => {
    // Dacă nu avem utilizator sau nu e aprobat, nu încercăm să citim din DB
    if (!user || !approved) {
      setTransactions([]);
      setDebts([]);
      setNoteGroups([]);
      return;
    }

    const userRef = (path) => collection(db, 'users', user.uid, path);

    // 1. Listen Transactions
    const transUnsub = onSnapshot(userRef('transactions'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    // 2. Listen Debts
    const debtsUnsub = onSnapshot(userRef('debts'), (snap) => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Listen Note Groups
    const notesUnsub = onSnapshot(userRef('noteGroups'), (snap) => {
      setNoteGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Cleanup la unmount
    return () => {
      transUnsub();
      debtsUnsub();
      notesUnsub();
    };
  }, [user, approved]);

  return { transactions, debts, noteGroups };
}