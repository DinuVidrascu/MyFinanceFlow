import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        const profileRef = doc(db, 'users', u.uid, 'profile', 'settings');
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists() && profileSnap.data().approved === true) {
          setApproved(true);
        } else {
          // Creăm profilul dacă nu există sau dacă nu este aprobat
          await setDoc(profileRef, { 
            email: u.email, 
            displayName: u.displayName || u.email, 
            approved: false,
            requestedAt: new Date().toISOString()
          }, { merge: true });
          setApproved(false);
        }
      }
      setCheckingApproval(false);
    });

    return unsub;
  }, []);

  return { user, loading, approved, checkingApproval };
}