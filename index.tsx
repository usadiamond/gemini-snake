import React from 'react';
import ReactDOM from 'react-dom/client';
import './firebase'; // Ensures Firebase is initialized once on startup
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
