import React, { useState } from 'react';

interface StartScreenProps {
  onStartGame: (nickname: string) => void;
  onOpenSettings: () => void;
  currentNickname: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onOpenSettings, currentNickname }) => {
  const [nickname, setNickname] = useState(currentNickname);

  const handleStart = () => {
    onStartGame(nickname.trim() || 'Player');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 p-8 z-10">
      <h2 className="text-5xl font-extrabold mb-6 text-emerald-400 animate-pulse">Welcome to Slither Fury!</h2>
      <p className="text-xl text-gray-300 mb-8">Eat pellets to grow and avoid other snakes to survive!</p>
      
      <div className="w-full max-w-sm mb-8">
        <label htmlFor="nickname-input" className="block text-center text-lg text-gray-300 mb-2">Enter your nickname:</label>
        <input
          id="nickname-input"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={15}
          className="w-full px-4 py-3 bg-gray-700 text-white text-xl text-center border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="e.g., Serpent Supreme"
        />
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          aria-label="Start Game"
        >
          Start Game
        </button>
        <button
          onClick={onOpenSettings}
          className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-sky-300"
          aria-label="Open Game Settings"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default StartScreen;