import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // 1. Verificăm în localStorage
    const saved = localStorage.getItem('financeflow-theme');
    if (saved) return saved === 'dark';
    // 2. Fallback la sistemul de operare
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('financeflow-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('financeflow-theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark];
}
