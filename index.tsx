// 1. Existing React imports (do not remove these)
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// 2. Your Firebase imports and configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Your Firebase config
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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get a unique ID for this player
const myPlayerId = 'user_' + Math.random().toString(36).substr(2, 9);
const myPlayerRef = ref(database, 'players/' + myPlayerId);

// The main App component
const App = () => {
    // State to hold all players' data
    const [allPlayers, setAllPlayers] = useState({});

    // Use a useEffect hook to set up the Firebase listener
    // This runs once when the component mounts
    useEffect(() => {
        // Set up a listener for all player data
        onValue(ref(database, 'players'), (snapshot) => {
            const data = snapshot.val() || {};
            setAllPlayers(data);
        });

        // Set initial player data and handle disconnections
        set(myPlayerRef, { x: 400, y: 300 });
        myPlayerRef.onDisconnect().remove();

        // This is the cleanup function that runs when the component unmounts
        return () => {
            myPlayerRef.onDisconnect(null); // Clear the disconnect handler
            myPlayerRef.remove();
        };
    }, []);

    // Function to update the player's position in Firebase
    const updateMyPosition = (newX: number, newY: number) => {
        set(myPlayerRef, { x: newX, y: newY });
    };

    // A simple visual representation of the players
    const playersToRender = Object.values(allPlayers);
    
    return (
        <div style={{ position: 'relative', width: '800px', height: '600px', border: '1px solid white' }}>
            {playersToRender.map((player: any, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        backgroundColor: player.x === myPlayerId ? 'green' : 'red',
                        left: player.x + 'px',
                        top: player.y + 'px',
                        borderRadius: '50%'
                    }}
                />
            ))}
        </div>
    );
};

// This is the code that renders your app to the HTML
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);