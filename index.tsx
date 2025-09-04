// 1. Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// 2. Add your Firebase configuration object here
// Replace these with your actual values from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyApY5vIrS-by7VTZnma7TWdnyoUOohr08g",
  authDomain: "snake-447a3.firebaseapp.com",
  projectId: "snake-447a3",
  storageBucket: "snake-447a3.firebasestorage.app",
  messagingSenderId: "962445311597",
  appId: "1:962445311597:web:aa6676df486f7bd77a4964",
  measurementId: "G-XWT29YE235"
};

// 3. Initialize Firebase app
const app = initializeApp(firebaseConfig);

// 4. Get a reference to the Realtime Database service
const database = getDatabase(app);

// 5. Write a simple test to the database to confirm the connection
// This will create a 'test/message' entry in your database
function writeTestData() {
  const testRef = ref(database, 'test/message');
  set(testRef, 'Hello from your React game!');
}
writeTestData();

// Your existing React code will follow this...
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// ...