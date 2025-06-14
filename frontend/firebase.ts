
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDc_u-hIBrrZ0ENypfsEYhIaFtPZXBN9rw",
  authDomain: 'lifemate-ai-5cfda.firebaseapp.com',
  projectId: 'lifemate-ai-5cfda',
  storageBucket: 'lifemate-ai-5cfda.firebasestorage.app',
  messagingSenderId: '746404765482',
  appId: '1:746404765482:web:67ca8960668b4edb774853',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
