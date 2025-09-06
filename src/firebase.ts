// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyC1nEP794mgw6iUKvj9vbJoT7ioWE9-8ho",
authDomain: "gemini-snake.firebaseapp.com",
projectId: "gemini-snake",
storageBucket: "gemini-snake.firebasestorage.app",
messagingSenderId: "475881148187",
  databaseURL: "https://gemini-snake-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);