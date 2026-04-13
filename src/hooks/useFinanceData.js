import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

export function useFinanceData(user, approved) {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [noteGroups, setNoteGroups] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    if (!user || !approved) {
      setTransactions([]);
      setDebts([]);
      setNoteGroups([]);
      setCustomCategories([]);
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

    // 4. Listen Custom Categories
    const catsUnsub = onSnapshot(userRef('customCategories'), (snap) => {
      setCustomCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Cleanup la unmount
    return () => {
      transUnsub();
      debtsUnsub();
      notesUnsub();
      catsUnsub();
    };
  }, [user, approved]);

  return { transactions, debts, noteGroups, customCategories };
}