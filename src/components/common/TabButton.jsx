import React from 'react';

export default function TabButton({ id, icon: Icon, label, activeTab, setActiveTab }) {
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors duration-200 ${
        activeTab === id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
}