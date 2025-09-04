// 1. Existing React imports (do not remove these)
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// 2. Your Firebase imports and configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyApY5vIrS-by7VTZnma7TWdnyoUOohr08g",
    authDomain: "snake-447a3.firebaseapp.com",
    projectId: "snake-447a3",
    storageBucket: "snake-447a3.firebasestorage.app",
    messagingSenderId: "962445311597",
    appId: "1:962445311597:web:aa6676df486f7bd77a4964",
    measurementId: "G-XWT29YE235"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 4. A function to test the database connection
const writeTestData = () => {
  const testRef = ref(database, 'test/message');
  set(testRef, 'Hello from your React game!')
    .then(() => {
      console.log("Data written successfully!");
    })
    .catch((error) => {
      console.error("Error writing data: ", error);
    });
};

// 5. Your main App component
const App = () => {
    // We use a useEffect hook to run the test code once when the app loads
    useEffect(() => {
        writeTestData();
    }, []); // The empty array ensures this runs only once

    return (
        // This is where your game's visual components will be rendered
        <div>
            <h1>Bubble Snake</h1>
            <p>Check the Firebase Realtime Database for the "test" node!</p>
        </div>
    );
};

// 6. This is the code that renders your app to the HTML
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);