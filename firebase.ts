// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApY5vIrS-by7VTZnma7TWdnyoUOohr08g",
  authDomain: "snake-447a3.firebaseapp.com",
  projectId: "snake-447a3",
  storageBucket: "snake-447a3.firebasestorage.app",
  messagingSenderId: "962445311597",
  appId: "1:962445311597:web:aa6676df486f7bd77a4964",
  databaseURL: "https://snake-447a3-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
