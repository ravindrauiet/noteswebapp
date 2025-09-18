// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCslOVHFkY3JmEAbsLZVHrmD09_FhKmoyA",
  authDomain: "noteswebapp-7ab1e.firebaseapp.com",
  projectId: "noteswebapp-7ab1e",
  storageBucket: "noteswebapp-7ab1e.firebasestorage.app",
  messagingSenderId: "152751015910",
  appId: "1:152751015910:web:822f3d4f3544948889b827"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
