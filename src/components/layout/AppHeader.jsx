import React from 'react';
import { Wallet, Calendar, Tag, Bell, Moon, Sun, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function AppHeader({ onHistoryOpen, onCatsOpen }) {
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { permission, requestPermission } = usePushNotifications();
  const [isDark, setIsDark] = useDarkMode();

  return (
    <>
      {!isOnline && (
        <div className="bg-orange-500 text-white text-xs font-bold py-2 px-4 flex justify-center items-center gap-2 shadow-sm z-50 sticky top-0">
          Mod Offline - Sincronizare la reconectare
        </div>
      )}
      <header className={`bg-white dark:bg-slate-800 p-6 shadow-sm sticky ${isOnline ? 'top-0' : 'top-[32px]'} z-20 flex justify-between items-center transition-all duration-300`}>
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition">
          <h1 className="font-black text-xl flex items-center gap-2 text-gray-800 dark:text-white">
            <Wallet className="text-blue-600 dark:text-blue-400" /> FinanceFlow
          </h1>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {permission !== 'granted' && isOnline && (
            <button
              onClick={requestPermission}
              className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-800/50 flex items-center shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
            >
              <Bell size={20} className="animate-pulse" />
            </button>
          )}

          <button
            onClick={() => navigate('/notes')}
            className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
            title="Notițe & Bugete"
          >
            <ClipboardList size={20} />
          </button>

          <button
            onClick={onCatsOpen}
            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            title="Categorii Personalizate"
          >
            <Tag size={20} />
          </button>

          <button
            onClick={onHistoryOpen}
            className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
          >
            <Calendar size={20} />
          </button>
        </div>
      </header>
    </>
  );
}
