import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project config for Ambi-Tech
// Note: this API key is safe to expose in client code — Firebase apps are
// secured via Firestore/Auth security rules, not by hiding this key.
const firebaseConfig = {
  apiKey: "AIzaSyAhLRfftP2XdhnVT1EB2CIRwCAHQtQ3BSg",
  authDomain: "ambi-c8ba3.firebaseapp.com",
  projectId: "ambi-c8ba3",
  storageBucket: "ambi-c8ba3.firebasestorage.app",
  messagingSenderId: "609564954184",
  appId: "1:609564954184:web:d19e28b3a2785d30b2d27d",
  measurementId: "G-DP5GLQJ98K",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);