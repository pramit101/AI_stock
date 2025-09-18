import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB1kSyLQUl4kZMqdI8QgrT0cfyfbMjr5G0",
  authDomain: "pentavision-9d7da.firebaseapp.com",
  projectId: "pentavision-9d7da",
  storageBucket: "pentavision-9d7da.appspot.com",
  messagingSenderId: "272628914654",
  appId: "1:272628914654:web:8247b56789bdeae26ee54f",
  measurementId: "G-DTRS2MYNZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication
export const auth = getAuth(app);

// Export Firestore Database
export const db = getFirestore(app);
