// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApY5vIrS-by7VTZnma7TWdnyoUOohr08g",
  authDomain: "snake-447a3.firebaseapp.com",
  projectId: "snake-447a3",
  storageBucket: "snake-447a3.firebasestorage.app",
  messagingSenderId: "962445311597",
  appId: "1:962445311597:web:aa6676df486f7bd77a4964",
  measurementId: "G-XWT29YE235"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
