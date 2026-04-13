import { useMemo } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { CATEGORIES } from '../constants/categories';
import { ICON_MAP } from '../constants/icons';

export function useCategories(user, customCategories) {
  const allCategories = useMemo(() => {
    return [...CATEGORIES, ...customCategories];
  }, [customCategories]);

  const allIconMap = useMemo(() => {
    const extra = {};
    customCategories.forEach(c => {
      if (ICON_MAP[c.icon]) extra[c.icon] = ICON_MAP[c.icon];
    });
    return { ...ICON_MAP, ...extra };
  }, [customCategories]);

  const handleSaveCustomCategory = async (cat) => {
    if (!user) return;
    const { id, ...data } = cat;
    await setDoc(doc(db, 'users', user.uid, 'customCategories', id), data);
  };

  const handleDeleteCustomCategory = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'customCategories', id));
  };

  return {
    allCategories,
    allIconMap,
    handleSaveCustomCategory,
    handleDeleteCustomCategory,
  };
}
