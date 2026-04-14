// lib/firebase.js
// ─────────────────────────────────────────────────────────────
// 🔑 API KEYS LOCATION — Firebase (Push Notifications)
//    1. Go to https://console.firebase.google.com
//    2. Create project → "Add app" → Web app
//    3. Copy the firebaseConfig object shown
//    4. Paste values into .env.local:
//       NEXT_PUBLIC_FIREBASE_API_KEY=...
//       NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
//       NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
//       NEXT_PUBLIC_FIREBASE_APP_ID=...
//    5. Go to Project Settings → Cloud Messaging
//       Copy "Server key" → FIREBASE_SERVER_KEY in .env.local
//
//    FREE TIER: Unlimited push notifications forever
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// 🔑 These values come from .env.local
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let messaging;

function initFirebase() {
  if (!firebaseConfig.apiKey) {
    console.warn('⚠️  Firebase not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local');
    return false;
  }
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  }
  return true;
}

/**
 * Request push notification permission and return FCM token.
 * Call this from the driver's browser after login.
 * Store the returned token in Supabase trucks.driver_fcm_token
 */
export async function requestNotificationToken() {
  if (typeof window === 'undefined') return null;
  if (!initFirebase()) return null;

  try {
    messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    console.log('FCM token:', token);
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

/**
 * Listen for incoming push messages when app is in foreground.
 * @param {Function} callback — called with { title, body } when message arrives
 */
export function onPushMessage(callback) {
  if (typeof window === 'undefined' || !messaging) return;
  return onMessage(messaging, payload => {
    callback({
      title: payload.notification?.title || 'GhostHaul',
      body: payload.notification?.body || 'New match found',
    });
  });
}
