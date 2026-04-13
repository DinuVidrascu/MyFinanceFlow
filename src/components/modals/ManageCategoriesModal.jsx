import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Check, Tag } from 'lucide-react';
import {
  ShoppingBag, Cookie, Car, Home as HomeIcon, Zap, Smartphone,
  Wifi, Gift, Heart, Briefcase, Plane, Music, Book, Smile,
  Wallet, TrendingUp, Coins, Landmark, PiggyBank, Coffee,
  Dumbbell, Baby, Scissors, Dog, Gamepad2, Shirt, Bus,
  GraduationCap, Stethoscope, Wrench, Pizza, Star,
  Bike, Train, TreePine,
  Sun, Flame,
  Camera, Tv, Headphones, Monitor, Printer,
  Wine, Utensils,
  Building, Store, Building2,
  Palette, Pencil, FileText,
  Trophy, Medal, Target, Flag, Shield,
  Leaf, Mountain, Waves,
  Package, ShoppingCart, CreditCard, Banknote, Receipt, Percent,
  Mail, MessageCircle, Globe, Map,
  Newspaper, Anchor, Feather, Compass, Thermometer, Umbrella
} from 'lucide-react';

const AVAILABLE_ICONS = [
  // Transport
  { key: 'transport', el: <Car size={20} /> },
  { key: 'bus', el: <Bus size={20} /> },
  { key: 'bike', el: <Bike size={20} /> },
  { key: 'plane', el: <Plane size={20} /> },
  { key: 'train', el: <Train size={20} /> },
  { key: 'anchor', el: <Anchor size={20} /> },
  // Mâncare & Băuturi
  { key: 'food', el: <Cookie size={20} /> },
  { key: 'pizza', el: <Pizza size={20} /> },
  { key: 'coffee', el: <Coffee size={20} /> },
  { key: 'utensils', el: <Utensils size={20} /> },
  { key: 'wine', el: <Wine size={20} /> },
  // Locuință & Clădiri
  { key: 'housing', el: <HomeIcon size={20} /> },
  { key: 'building', el: <Building size={20} /> },
  { key: 'store', el: <Store size={20} /> },
  { key: 'building2', el: <Building2 size={20} /> },
  // Utilități & Tech  
  { key: 'utilities', el: <Zap size={20} /> },
  { key: 'phone', el: <Smartphone size={20} /> },
  { key: 'internet', el: <Wifi size={20} /> },
  { key: 'tv', el: <Tv size={20} /> },
  { key: 'headphones', el: <Headphones size={20} /> },
  { key: 'monitor', el: <Monitor size={20} /> },
  { key: 'printer', el: <Printer size={20} /> },
  { key: 'camera', el: <Camera size={20} /> },
  // Finanțe
  { key: 'salary', el: <Wallet size={20} /> },
  { key: 'investment', el: <TrendingUp size={20} /> },
  { key: 'savings_stash', el: <Coins size={20} /> },
  { key: 'savings_bank', el: <Landmark size={20} /> },
  { key: 'savings_goal', el: <PiggyBank size={20} /> },
  { key: 'creditcard', el: <CreditCard size={20} /> },
  { key: 'banknote', el: <Banknote size={20} /> },
  { key: 'receipt', el: <Receipt size={20} /> },
  { key: 'percent', el: <Percent size={20} /> },
  // Cumpărături
  { key: 'shopping', el: <ShoppingBag size={20} /> },
  { key: 'cart', el: <ShoppingCart size={20} /> },
  { key: 'package', el: <Package size={20} /> },
  { key: 'clothing', el: <Shirt size={20} /> },
  { key: 'gifts', el: <Gift size={20} /> },
  // Sănătate & Sport
  { key: 'health', el: <Heart size={20} /> },
  { key: 'doctor', el: <Stethoscope size={20} /> },
  { key: 'gym', el: <Dumbbell size={20} /> },
  { key: 'target', el: <Target size={20} /> },
  { key: 'trophy', el: <Trophy size={20} /> },
  { key: 'medal', el: <Medal size={20} /> },
  { key: 'thermometer', el: <Thermometer size={20} /> },
  // Familie & Personal
  { key: 'baby', el: <Baby size={20} /> },
  { key: 'beauty', el: <Scissors size={20} /> },
  { key: 'pet', el: <Dog size={20} /> },
  // Educație & Muncă
  { key: 'work', el: <Briefcase size={20} /> },
  { key: 'education', el: <Book size={20} /> },
  { key: 'school', el: <GraduationCap size={20} /> },
  { key: 'pencil', el: <Pencil size={20} /> },
  { key: 'filetext', el: <FileText size={20} /> },
  { key: 'newspaper', el: <Newspaper size={20} /> },
  // Divertisment
  { key: 'entertainment', el: <Music size={20} /> },
  { key: 'gaming', el: <Gamepad2 size={20} /> },
  { key: 'palette', el: <Palette size={20} /> },
  // Natură & Altele
  { key: 'travel', el: <TreePine size={20} /> },
  { key: 'sun', el: <Sun size={20} /> },
  { key: 'flame', el: <Flame size={20} /> },
  { key: 'leaf', el: <Leaf size={20} /> },
  { key: 'mountain', el: <Mountain size={20} /> },
  { key: 'waves', el: <Waves size={20} /> },
  { key: 'umbrella', el: <Umbrella size={20} /> },
  { key: 'compass', el: <Compass size={20} /> },
  { key: 'feather', el: <Feather size={20} /> },
  // Comunicare
  { key: 'mail', el: <Mail size={20} /> },
  { key: 'message', el: <MessageCircle size={20} /> },
  { key: 'globe', el: <Globe size={20} /> },
  { key: 'map', el: <Map size={20} /> },
  // Diverse
  { key: 'repair', el: <Wrench size={20} /> },
  { key: 'shield', el: <Shield size={20} /> },
  { key: 'flag', el: <Flag size={20} /> },
  { key: 'other', el: <Smile size={20} /> },
  { key: 'star', el: <Star size={20} /> },
];

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#64748b', '#78716c',
];

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Cheltuială' },
  { value: 'income', label: 'Venit' },
  { value: 'savings', label: 'Economii' },
];

const emptyForm = { label: '', icon: 'star', color: '#6366f1', type: 'expense' };

export default function ManageCategoriesModal({ isOpen, onClose, customCategories, onSave, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState('list'); // 'list' | 'add'

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    const id = editingId || `custom_${Date.now()}`;
    onSave({ id, ...form, label: form.label.trim(), custom: true });
    setForm(emptyForm);
    setEditingId(null);
    setTab('list');
  };

  const startEdit = (cat) => {
    setForm({ label: cat.label, icon: cat.icon, color: cat.color || '#6366f1', type: cat.type });
    setEditingId(cat.id);
    setTab('add');
  };

  const iconEl = (key) => AVAILABLE_ICONS.find(i => i.key === key)?.el;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-white">Categorii Personalizate</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">{customCategories.length} categorii create</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-3 gap-2 border-b border-gray-100 dark:border-slate-700">
          <button
            onClick={() => { setTab('list'); setForm(emptyForm); setEditingId(null); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${tab === 'list' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            Lista Mea
          </button>
          <button
            onClick={() => setTab('add')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${tab === 'add' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            {editingId ? 'Editează' : '+ Adaugă Nouă'}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <AnimatePresence mode="wait">
            {tab === 'list' ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {customCategories.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                    <Tag size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Nicio categorie personalizată</p>
                    <p className="text-xs mt-1">Apasă „+ Adaugă Nouă" pentru a crea prima ta categorie</p>
                  </div>
                ) : (
                  customCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: (cat.color || '#6366f1') + '25', color: cat.color || '#6366f1' }}>
                          {iconEl(cat.icon) || <Star size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800 dark:text-white">{cat.label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{TYPE_OPTIONS.find(t => t.value === cat.type)?.label}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition">
                          <Tag size={15} />
                        </button>
                        <button onClick={() => onDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Tip */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Tip Tranzacție</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={`py-2 rounded-xl text-sm font-bold transition ${form.type === t.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nume */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Numele Categoriei</label>
                  <input
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="ex: Abonament Gym"
                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Culoare */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Culoare</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                        style={{ backgroundColor: c }}
                      >
                        {form.color === c && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pictogramă */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Pictogramă</label>
                  <div className="grid grid-cols-8 gap-2">
                    {AVAILABLE_ICONS.map(({ key, el }) => (
                      <button
                        key={key}
                        onClick={() => setForm(f => ({ ...f, icon: key }))}
                        className={`p-2 rounded-xl flex items-center justify-center transition ${form.icon === key ? 'ring-2 ring-offset-1 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                        style={form.icon === key ? { backgroundColor: form.color, ringColor: form.color } : {}}
                      >
                        {el}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-600">
                  <div className="p-2.5 rounded-full" style={{ backgroundColor: form.color + '25', color: form.color }}>
                    {iconEl(form.icon) || <Star size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{form.label || 'Previzualizare'}</p>
                    <p className="text-xs text-gray-400">{TYPE_OPTIONS.find(t => t.value === form.type)?.label}</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.label.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {editingId ? 'Salvează Modificările' : 'Adaugă Categoria'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
