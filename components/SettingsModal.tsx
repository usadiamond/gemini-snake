
import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
  currentSettings: GameSettings;
  defaultSettings: GameSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  defaultSettings,
}) => {
  const [tempSettings, setTempSettings] = useState<GameSettings>(currentSettings);

  useEffect(() => {
    setTempSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, valueAsNumber, value, type, checked } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' || type === 'range' ? valueAsNumber : value),
    }));
  };

  const handleSave = () => {
    onSave(tempSettings);
  };

  const handleResetToDefaults = () => {
    setTempSettings(defaultSettings);
  };

  const labelStyle = "block mb-1 text-sm font-medium text-gray-300";
  const rangeValueStyle = "ml-2 text-emerald-400 font-semibold";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-white">
        <h2 id="settings-modal-title" className="text-2xl font-bold mb-6 text-emerald-400">Game Settings</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="snakeSpeed" className={labelStyle}>
              Snake Speed: 
              <span className={rangeValueStyle}>{tempSettings.snakeSpeed.toFixed(1)}</span>
            </label>
            <input
              type="range"
              id="snakeSpeed"
              name="snakeSpeed"
              min="1"
              max="5" 
              step="0.1"
              value={tempSettings.snakeSpeed}
              onChange={handleChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="worldRadius" className={labelStyle}>
              World Radius:
              <span className={rangeValueStyle}>{tempSettings.worldRadius} px</span>
            </label>
            <input
              type="range"
              id="worldRadius"
              name="worldRadius"
              min="300" 
              max="2000"
              step="50"
              value={tempSettings.worldRadius}
              onChange={handleChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="aiSnakeCount" className={labelStyle}>
              AI Bot Count:
              <span className={rangeValueStyle}>{tempSettings.aiSnakeCount}</span>
            </label>
            <input
              type="range"
              id="aiSnakeCount"
              name="aiSnakeCount"
              min="0"
              max="10" 
              step="1"
              value={tempSettings.aiSnakeCount}
              onChange={handleChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label htmlFor="shrinkingWorldEnabled" className={labelStyle}>
              Shrinking World:
              <span className="text-xs text-gray-400 block font-normal">The arena gets smaller over time.</span>
            </label>
            <label htmlFor="shrinkingWorldEnabled" className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="shrinkingWorldEnabled"
                name="shrinkingWorldEnabled"
                checked={!!tempSettings.shrinkingWorldEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Save & Close
          </button>
          <button
            onClick={handleResetToDefaults}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
