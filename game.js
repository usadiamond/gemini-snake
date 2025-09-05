// 1. Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyApY5vIrS-by7VTZnma7TWdnyoUOohr08g",
    authDomain: "snake-447a3.firebaseapp.com",
    projectId: "snake-447a3",
    storageBucket: "snake-447a3.firebasestorage.app",
    messagingSenderId: "962445311597",
    appId: "1:962445311597:web:aa6676df486f7bd77a4964",
    measurementId: "G-XWT29YE235"
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. Write a simple test to the database
function writeTestData() {
    const testRef = database.ref('test/message');
    testRef.set('Hello from your game!');
}

// 4. Run the test function when the window loads
window.onload = function() {
    writeTestData();
    document.getElementById('root').innerHTML = "<h1>Connection Verified!</h1><p>Check the Firebase Realtime Database for the 'test' node.</p>";
};

// 5. Just a change to push