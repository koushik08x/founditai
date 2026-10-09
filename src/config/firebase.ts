import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your-firebase-api-key' &&
    firebaseConfig.projectId !== 'your-firebase-project-id'
  );
};

// Initialize Firebase singletons
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured()
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export const FIREBASE_CONFIG_HELP = {
  projectId: firebaseConfig.projectId || '(not configured)',
  hasApiKey: Boolean(firebaseConfig.apiKey),
  isLive: isFirebaseConfigured()
};
