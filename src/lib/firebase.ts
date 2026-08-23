// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Untuk setup Firebase:
// 1. Buka https://console.firebase.google.com
// 2. Buat project baru
// 3. Aktifkan Authentication (Email/Password)
// 4. Buat Firestore Database
// 5. Aktifkan Storage
// 6. Copy config di bawah ini

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Ganti dengan Firebase config kamu
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
