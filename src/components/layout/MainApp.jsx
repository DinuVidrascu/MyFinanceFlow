import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- Hooks ---
import { useFinanceData } from '../../hooks/useFinanceData';
import { useFinanceTotals } from '../../hooks/useFinanceTotals';
import { useTransactions } from '../../hooks/useTransactions';
import { useDebts } from '../../hooks/useDebts';
import { useNotes } from '../../hooks/useNotes';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency } from '../../utils/helpers';

// (imports curate — ClipboardList eliminat, mutat în AppNav)
import AppHeader from './AppHeader';
import AppNav from './AppNav';

// --- Pages ---
import Dashboard from '../../pages/Dashboard';
import Transactions from '../../pages/Transactions';
import Debts from '../../pages/Debts';
import Notes from '../../pages/Notes';
import Analytics from '../../pages/Analytics';

// --- Modals ---
import AddTransactionModal from '../modals/AddTransactionModal';
import AddDebtModal from '../modals/AddDebtModal';
import AddNoteModal from '../modals/AddNoteModal';
import ImportModal from '../modals/ImportModal';
import HistoryModal from '../modals/HistoryModal';
import ConfirmModal from '../modals/ConfirmModal';
import ManageCategoriesModal from '../modals/ManageCategoriesModal';

// --- Page transition wrapper ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 15 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -15 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function MainApp({ user, approved }) {
  const location = useLocation();

  // ── Data din Firebase ──────────────────────────────────────────────────────
  const { transactions, debts, noteGroups, customCategories } = useFinanceData(user, approved);

  // ── Modal state simplu ─────────────────────────────────────────────────────
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showDebtModal,    setShowDebtModal]    = useState(false);
  const [showNoteModal,    setShowNoteModal]    = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showImportModal,  setShowImportModal]  = useState(false);
  const [showCatsModal,    setShowCatsModal]    = useState(false);
  const [viewHistoryMonth, setViewHistoryMonth] = useState(null);
  const [importConfig,     setImportConfig]     = useState({ target: '', source: '' });

  // ── Confirm dialog ─────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const confirmAction = (message, onConfirm) => setConfirmDialog({ isOpen: true, message, onConfirm });
  const closeConfirm  = () => setConfirmDialog({ isOpen: false, message: '', onConfirm: null });

  // ── Business logic hooks ───────────────────────────────────────────────────
  const { allCategories, allIconMap, handleSaveCustomCategory, handleDeleteCustomCategory } =
    useCategories(user, customCategories);

  const { currentMonthTotals, historyGroups, notesTotalImpact } =
    useFinanceTotals(transactions, noteGroups);

  const trans = useTransactions(user, transactions, confirmAction);
  const debtsHook = useDebts(user, confirmAction);
  const notes = useNotes(user, noteGroups, confirmAction);

  // ── Helpere deschidere formulare ───────────────────────────────────────────
  const openAddNew = () => { trans.resetTransForm(); trans.setEditingId(null); setShowAddModal(true); };
  const openEditTrans = (t) => { trans.startEditTransaction(t); setShowAddModal(true); };
  const openAddForMonth = (monthKey) => {
    trans.resetTransForm();
    trans.setNewTrans(p => ({ ...p, date: `${monthKey}-01` }));
    trans.setEditingId(null);
    setShowAddModal(true);
  };

  const openDebtNew  = () => { debtsHook.resetDebtForm(); debtsHook.setEditingDebtId(null); setShowDebtModal(true); };
  const openEditDebt = (d) => { debtsHook.startEditDebt(d); setShowDebtModal(true); };

  const openNoteNew  = () => { notes.openNoteGroupModal(); setShowNoteModal(true); };
  const openEditNote = (g) => { notes.openNoteGroupModal(g); setShowNoteModal(true); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 pb-24 relative transition-colors duration-300">

      <AppHeader
        onHistoryOpen={() => setShowHistoryModal(true)}
        onCatsOpen={() => setShowCatsModal(true)}
      />

      <main className="max-w-md mx-auto p-4 w-full relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageWrapper>
                <Dashboard
                  currentMonthTotals={currentMonthTotals}
                  transactions={transactions}
                  formatCurrency={formatCurrency}
                  ICON_MAP={allIconMap}
                  CATEGORIES={allCategories}
                />
              </PageWrapper>
            } />

            <Route path="/transactions" element={
              <PageWrapper>
                <Transactions
                  transactions={transactions}
                  openAddModal={openAddNew}
                  handleEditClick={openEditTrans}
                  handleDeleteTransaction={trans.handleDeleteTransaction}
                  formatCurrency={formatCurrency}
                  ICON_MAP={allIconMap}
                  CATEGORIES={allCategories}
                />
              </PageWrapper>
            } />

            <Route path="/debts" element={
              <PageWrapper>
                <Debts
                  debts={debts}
                  openDebtModal={openDebtNew}
                  handleEditDebt={openEditDebt}
                  handleDeleteDebt={debtsHook.handleDeleteDebt}
                  formatCurrency={formatCurrency}
                />
              </PageWrapper>
            } />

            <Route path="/notes" element={
              <PageWrapper>
                <Notes
                  noteGroups={noteGroups}
                  openNoteGroupModal={(g) => g ? openEditNote(g) : openNoteNew()}
                  handleDeleteGroup={notes.handleDeleteGroup}
                  toggleSubItemCheck={notes.toggleSubItemCheck}
                  getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)}
                  notesTotalImpact={notesTotalImpact}
                  formatCurrency={formatCurrency}
                />
              </PageWrapper>
            } />

            <Route path="/analytics" element={
              <PageWrapper>
                <Analytics
                  transactions={transactions}
                  formatCurrency={formatCurrency}
                  CATEGORIES={allCategories}
                  ICON_MAP={allIconMap}
                />
              </PageWrapper>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* ── Modale ─────────────────────────────────────────────────────────── */}
      <AddTransactionModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newTrans={trans.newTrans}
        setNewTrans={trans.setNewTrans}
        editingId={trans.editingId}
        handleSaveTransaction={async () => { const ok = await trans.handleSaveTransaction(); if (ok) setShowAddModal(false); }}
        CATEGORIES={allCategories}
        ICON_MAP={allIconMap}
      />

      <AddDebtModal
        showDebtModal={showDebtModal}
        setShowDebtModal={setShowDebtModal}
        newDebt={debtsHook.newDebt}
        setNewDebt={debtsHook.setNewDebt}
        editingDebtId={debtsHook.editingDebtId}
        handleSaveDebt={async () => { const ok = await debtsHook.handleSaveDebt(); if (ok) setShowDebtModal(false); }}
      />

      <AddNoteModal
        showNoteModal={showNoteModal}
        setShowNoteModal={setShowNoteModal}
        currentGroup={notes.currentGroup}
        setCurrentGroup={notes.setCurrentGroup}
        handleAddSubItem={notes.addSubItem}
        handleRemoveSubItem={notes.removeSubItem}
        handleSubItemChange={notes.changeSubItem}
        handleSaveNoteGroup={async () => { const ok = await notes.handleSaveNoteGroup(); if (ok) setShowNoteModal(false); }}
        getGroupTotal={(items) => items.reduce((a, b) => a + Number(b.cost || 0), 0)}
        formatCurrency={formatCurrency}
      />

      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        importConfig={importConfig}
        setImportConfig={setImportConfig}
        handleImportMonth={async () => { await trans.handleImportMonth(transactions, importConfig); setShowImportModal(false); }}
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
        handleDeleteTransaction={trans.handleDeleteTransaction}
        handleEditClick={openEditTrans}
        openAddModalForMonth={openAddForMonth}
        confirmAction={confirmAction}
      />

      <ManageCategoriesModal
        isOpen={showCatsModal}
        onClose={() => setShowCatsModal(false)}
        customCategories={customCategories}
        onSave={handleSaveCustomCategory}
        onDelete={handleDeleteCustomCategory}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      {/* ── Undo Toast ─────────────────────────────────────────────────────── */}
      {trans.undoItem && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 w-[90%] max-w-sm justify-between">
          <span className="text-sm">Tranzacție ștearsă</span>
          <button onClick={trans.handleUndo} className="flex items-center gap-1 text-blue-300 font-bold hover:text-white">
            ↩ UNDO
          </button>
        </div>
      )}

      <AppNav onAddClick={openAddNew} />
    </div>
  );
}
