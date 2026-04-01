importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA9pt_blZ3V8XY8EF8EhJigd2cyCHvQ_d4",
  authDomain: "financeflow-sync-1655c.firebaseapp.com",
  projectId: "financeflow-sync-1655c",
  storageBucket: "financeflow-sync-1655c.firebasestorage.app",
  messagingSenderId: "798966993670",
  appId: "1:798966993670:web:c8943998f5b2a921568487"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || "FinanceFlow Alert";
    const notificationOptions = {
      body: payload.notification.body || "Să nu uiți să treci cheltuielile!",
      icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// CERINȚE OBLIGATORII PENTRU PWA (Instalare)
// Pentru ca Google Chrome să afișeze butonul "Install App",
// un Service Worker trebuie să capteze evenimentul de 'fetch'
// ==========================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed!');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated!');
  // Preia imediat controlul tuturor paginilor deschise
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Un handler pasiv de fetch e suficient ca browser-ul să
  // valideze aplicația ca fiind o PWA instalabilă!
});

