import React from 'react';
import { Wallet } from 'lucide-react';

export default function LoginScreen({ handleGoogleLogin }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl -z-0 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl -z-0 -ml-32 -mb-32"></div>
      
      <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 w-full max-w-sm text-center relative z-10 transform -translate-y-4">
        <div className="mb-8 relative inline-flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-full h-full rounded-3xl text-white shadow-xl relative flex items-center justify-center">
            <Wallet size={40} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">FinanceFlow</h2>
          <p className="text-gray-500 text-sm font-medium">Gestionează-ți finanțele cu stil</p>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-gray-800 hover:shadow-xl active:scale-[0.98] transition-all group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
          <span>Continuă cu Google</span>
        </button>
        
        <p className="mt-8 text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Securizat prin Firebase Auth</p>
      </div>
    </div>
  );
}
