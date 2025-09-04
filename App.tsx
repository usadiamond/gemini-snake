import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import SettingsModal from './components/SettingsModal'; // Import SettingsModal
import { GameState, GameSettings } from './types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  OUT_OF_BOUNDS_BG_COLOR,
  DEFAULT_SNAKE_SPEED,
  DEFAULT_WORLD_RADIUS,
  DEFAULT_AI_SNAKE_COUNT,
  DEFAULT_SHRINKING_WORLD_ENABLED
} from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);
  const [score, setScore] = useState<number>(0);
  const [playerNickname, setPlayerNickname] = useState<string>('Player');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    snakeSpeed: DEFAULT_SNAKE_SPEED,
    worldRadius: DEFAULT_WORLD_RADIUS,
    aiSnakeCount: DEFAULT_AI_SNAKE_COUNT,
    shrinkingWorldEnabled: DEFAULT_SHRINKING_WORLD_ENABLED,
  });

  const startGame = useCallback((nickname: string) => {
    setPlayerNickname(nickname || 'Player');
    setScore(0);
    setGameState(GameState.Playing);
    setIsSettingsModalOpen(false); // Ensure settings modal is closed when game starts
  }, []);

  const gameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GameOver);
  }, []);

  const backToStartScreen = useCallback(() => {
    setGameState(GameState.StartScreen);
  }, []);

  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const handleSaveSettings = useCallback((newSettings: GameSettings) => {
    setGameSettings(newSettings);
    setIsSettingsModalOpen(false);
  }, []);

  const defaultSettings: GameSettings = {
    snakeSpeed: DEFAULT_SNAKE_SPEED,
    worldRadius: DEFAULT_WORLD_RADIUS,
    aiSnakeCount: DEFAULT_AI_SNAKE_COUNT,
    shrinkingWorldEnabled: DEFAULT_SHRINKING_WORLD_ENABLED,
  };

  return (
    <div className="flex flex-col items-center w-screen min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-emerald-400 tracking-wider">Slither Fury</h1>
      <div 
        className="relative shadow-2xl overflow-hidden"
        style={{ 
          width: `${GAME_WIDTH}px`, 
          height: `${GAME_HEIGHT}px`,
          backgroundColor: OUT_OF_BOUNDS_BG_COLOR 
        }}
      >
        {gameState === GameState.StartScreen && (
          <StartScreen 
            onStartGame={startGame} 
            onOpenSettings={openSettingsModal} 
            currentNickname={playerNickname}
          />
        )}
        {gameState === GameState.Playing && <Game onGameOver={gameOver} gameSettings={gameSettings} playerNickname={playerNickname} />}
        {gameState === GameState.GameOver && <GameOverScreen score={score} onRestart={() => startGame(playerNickname)} onBackToMenu={backToStartScreen}/>}
      </div>
      
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeSettingsModal}
          onSave={handleSaveSettings}
          currentSettings={gameSettings}
          defaultSettings={defaultSettings}
        />
      )}
    </div>
  );
};

export default App;