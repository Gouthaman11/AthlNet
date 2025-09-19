// Firebase client initializer that reads config from Vite env vars
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Basic validation: apiKey is required for client SDK to work
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = undefined;
let initError = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Set authentication persistence to local storage
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Failed to set auth persistence:', error);
    });
    
    db = getFirestore(app);
    storage = getStorage(app);
    try {
      analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
    } catch (e) {
      analytics = undefined;
    }
  } catch (e) {
    // Initialization failed — keep variables null and surface warning
    initError = e?.message || String(e);
    console.warn('Firebase initialization failed:', initError);
    app = null;
    auth = null;
    db = null;
    storage = null;
    analytics = undefined;
  }
} else {
  initError = 'Missing VITE_FIREBASE_* environment variables (apiKey/authDomain/projectId)';
  console.warn('Firebase client not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN and VITE_FIREBASE_PROJECT_ID in your .env (or .env.local)');
}

// Export values (may be null if not configured)
export { app, auth, db, storage, analytics, isConfigured, initError };
