import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9pt_blZ3V8XY8EF8EhJigd2cyCHvQ_d4",
  authDomain: "financeflow-sync-1655c.firebaseapp.com",
  projectId: "financeflow-sync-1655c",
  storageBucket: "financeflow-sync-1655c.firebasestorage.app",
  messagingSenderId: "798966993670",
  appId: "1:798966993670:web:c8943998f5b2a921568487"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);