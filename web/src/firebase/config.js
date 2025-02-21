import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1kaXo4ClUtw2M3XKyFvpxKosJ4brbYIA",
  authDomain: "react-native-fitness-app-1c2cd.firebaseapp.com",
  projectId: "react-native-fitness-app-1c2cd",
  storageBucket: "react-native-fitness-app-1c2cd.firebasestorage.app",
  messagingSenderId: "182505494804",
  appId: "1:182505494804:web:997d8f3f2888a2722a4a01",
  measurementId: "G-KB4EW7SQT5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Clear any existing auth state when initializing
auth.signOut();

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

export { auth, db };
