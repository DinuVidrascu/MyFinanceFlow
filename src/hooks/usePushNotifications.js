import { useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../firebase/config'; // Necesită să exportăm `app` din config

export function usePushNotifications() {
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    try {
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      if (permResult === 'granted') {
        const messaging = getMessaging(app);

        // Înregistrăm Service Worker-ul standard
        const swUrl = '/firebase-messaging-sw.js';
        
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('SW Inregistrat pt Meseje:', registration);

        const currentToken = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY // Va veni din env
        });

        if (currentToken) {
          setFcmToken(currentToken);
          console.log('FCM Push Token obținut: ', currentToken);
          // Aici s-ar putea trimite token-ul în baza de date la profilul user-ului
        }
      }
    } catch (err) {
      console.warn('Abonarea la push a eșuat:', err);
    }
  }, []);

  // Opțional ascultăm mesaje în timp real (cât aplicația este deschisă)
  const listenToMessages = useCallback(() => {
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        new Notification(payload.notification.title || "FinanceFlow", {
          body: payload.notification.body || "Mesaj nou",
          icon: '/logo192.png'
        });
      });
    }
  }, [permission]);

  return { fcmToken, permission, requestPermission, listenToMessages };
}
