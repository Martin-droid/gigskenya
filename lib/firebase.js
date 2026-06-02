import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJn-Ps8REihlbA8TNQbnTty85Gd-BvbhQ",
  authDomain: "devgigs-1c874.firebaseapp.com",
  projectId: "devgigs-1c874",
  storageBucket: "devgigs-1c874.firebasestorage.app",
  messagingSenderId: "975958651022",
  appId: "1:975958651022:web:ec989a7259db0bd1e619df",
  measurementId: "G-L5BNZN1TY0"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export default app;
