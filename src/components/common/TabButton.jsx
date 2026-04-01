import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TabButton({ to, icon: Icon, label }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '');

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors duration-200 ${
        isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
}