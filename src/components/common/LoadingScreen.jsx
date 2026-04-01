import React from 'react';
import loadingGif from '../../assets/load.svg';

export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 z-50 fixed inset-0">
      <img src={loadingGif} alt="Loading..." className="w-24 h-24 mb-4 animate-spin opacity-80" />
      <h2 className="text-xl font-black text-blue-600 animate-pulse">FinanceFlow</h2>
      <p className="text-gray-400 text-sm mt-1">Sincronizăm balanța...</p>
    </div>
  );
}
