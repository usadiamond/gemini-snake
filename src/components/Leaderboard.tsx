import React from 'react';

interface LeaderboardProps {
  players: {
    id: string;
    nickname: string;
    score: number;
  }[];
  playerId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, playerId }) => {
  return (
    <div 
      className="absolute top-4 right-4 bg-black bg-opacity-40 p-3 rounded-lg w-64 text-white shadow-lg"
      style={{ zIndex: 1600 }}
      role="status"
      aria-live="polite"
    >
      <h3 className="text-xl font-bold mb-2 text-center text-yellow-300">Leaderboard</h3>
      <ol className="list-none p-0 m-0">
        {players.map((player, index) => (
          <li 
            key={player.id} 
            className={`flex justify-between items-center text-sm p-1.5 rounded ${
              player.id === playerId ? 'bg-emerald-500 bg-opacity-50 font-bold' : ''
            }`}
          >
            <span className="flex items-center">
              <span className="font-semibold w-6 text-right mr-2">{index + 1}.</span>
              <span className="truncate" title={player.nickname}>{player.nickname}</span>
            </span>
            <span className="font-mono">{player.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;