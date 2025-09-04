
import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onBackToMenu }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-95 p-8 z-10">
      <h2 className="text-6xl font-extrabold mb-4 text-red-500">Game Over!</h2>
      <p className="text-4xl text-gray-200 mb-8">Your Score: <span className="font-bold text-yellow-400">{score}</span></p>
      <div className="flex space-x-4">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          Play Again
        </button>
        <button
          onClick={onBackToMenu}
          className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-gray-400"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
