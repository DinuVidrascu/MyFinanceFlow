import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export function useNotes(user, noteGroups, confirmAction) {
  const [currentGroup, setCurrentGroup] = useState({ id: null, title: '', items: [] });

  const handleSaveNoteGroup = async () => {
    if (!user || !currentGroup.title.trim()) return;
    const data = {
      title: currentGroup.title.trim(),
      items: (currentGroup.items || []).filter(i => i.text.trim()).map(i => ({
        id: i.id || crypto.randomUUID(),
        text: i.text.trim(),
        cost: Number(i.cost || 0),
        checked: i.checked || false,
      })),
      updatedAt: new Date().toISOString(),
    };
    if (currentGroup.id) {
      await setDoc(doc(db, 'users', user.uid, 'noteGroups', currentGroup.id), data);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'noteGroups'), data);
    }
    return true;
  };

  const handleDeleteGroup = (id) => {
    confirmAction('Ești sigur(ă) că vrei să ștergi această listă?', async () => {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'noteGroups', id));
      } catch (e) {
        alert(e.message);
      }
    });
  };

  const toggleSubItemCheck = async (groupId, itemId) => {
    const group = noteGroups.find(g => g.id === groupId);
    if (!group) return;
    const updated = group.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    await updateDoc(doc(db, 'users', user.uid, 'noteGroups', groupId), { items: updated });
  };

  const addSubItem = () =>
    setCurrentGroup(g => ({ ...g, items: [...g.items, { id: crypto.randomUUID(), text: '', cost: '', checked: false }] }));

  const removeSubItem = (id) =>
    setCurrentGroup(g => ({ ...g, items: g.items.filter(i => i.id !== id) }));

  const changeSubItem = (id, field, value) =>
    setCurrentGroup(g => ({ ...g, items: g.items.map(i => i.id === id ? { ...i, [field]: value } : i) }));

  const openNoteGroupModal = (g = null) =>
    setCurrentGroup(g ? { ...g } : { id: null, title: '', items: [{ id: crypto.randomUUID(), text: '', cost: '', checked: false }] });

  return {
    currentGroup, setCurrentGroup,
    handleSaveNoteGroup,
    handleDeleteGroup,
    toggleSubItemCheck,
    addSubItem, removeSubItem, changeSubItem,
    openNoteGroupModal,
  };
}
