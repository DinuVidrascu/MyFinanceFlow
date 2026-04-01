import React from 'react';
import { ClipboardList } from 'lucide-react';
import { auth } from '../../firebase/config';

export default function PendingApprovalScreen({ userEmail }) {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-8 text-center animate-fade-in z-50">
      <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 max-w-sm w-full space-y-6 relative z-10">
        <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center animate-bounce">
          <ClipboardList size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800">Acces Restricționat</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Contul tău (<span className="text-blue-600 font-semibold">{userEmail}</span>) este în curs de verificare.
          </p>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
          <p className="text-xs text-blue-800 font-medium whitespace-pre-wrap">Așteaptă aprobarea administratorului pentru a accesa balanța.</p>
        </div>
        <button 
          onClick={() => auth.signOut()} 
          className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          Ieși din cont
        </button>
      </div>
    </div>
  );
}
