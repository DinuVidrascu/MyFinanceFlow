import React from 'react';
import { auth } from './firebase/config'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Hooks
import { useAuth } from './hooks/useAuth';

// Clean Extracted Components
import LoadingScreen from './components/common/LoadingScreen';
import LoginScreen from './components/auth/LoginScreen';
import PendingApprovalScreen from './components/auth/PendingApprovalScreen';
import MainApp from './components/layout/MainApp';

export default function App() {
  const { user, loading, approved, checkingApproval } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Eroare la logare: " + err.message);
    }
  };

  // 1. Show global loader if auth state or permissions are resolving
  if (loading || checkingApproval) {
    return <LoadingScreen />;
  }

  // 2. Show login screen if not authenticated
  if (!user) {
    return <LoginScreen handleGoogleLogin={handleGoogleLogin} />;
  }

  // 3. Show pending screen if user is registered but not approved by admin
  if (!approved) {
    return <PendingApprovalScreen userEmail={user.email} />;
  }

  // 4. Render main application if fully authenticated and approved
  return <MainApp user={user} approved={approved} />;
}