import React from 'react';
import { Point, Snake } from '../types';
import { 
  MINI_MAP_AI_COLOR, 
  MINI_MAP_AI_DOT_SIZE,
  MINI_MAP_BACKGROUND_COLOR,
  MINI_MAP_BORDER_COLOR,
  MINI_MAP_BORDER_THICKNESS,
  MINI_MAP_PLAYER_COLOR,
  MINI_MAP_PLAYER_DOT_SIZE
} from '../constants';

interface MiniMapProps {
  totalWorldRadius: number;
  currentPlayableRadius: number;
  worldCenterX: number;
  worldCenterY: number;
  playerWorldPos: Point;
  aiSnakes: Snake[];
  displayRadius: number;
}

const MiniMap: React.FC<MiniMapProps> = ({
  totalWorldRadius,
  currentPlayableRadius,
  worldCenterX,
  worldCenterY,
  playerWorldPos,
  aiSnakes,
  displayRadius,
}) => {
  let effectivePlayerPos = playerWorldPos || { x: worldCenterX, y: worldCenterY };

  const mapDiameter = displayRadius * 2;
  const scaleFactor = displayRadius / totalWorldRadius;

  const playerRelX = effectivePlayerPos.x - worldCenterX;
  const playerRelY = effectivePlayerPos.y - worldCenterY;

  let dotLeft = displayRadius + playerRelX * scaleFactor;
  let dotTop = displayRadius + playerRelY * scaleFactor;

  dotLeft = Math.max(MINI_MAP_PLAYER_DOT_SIZE / 2, Math.min(dotLeft, mapDiameter - MINI_MAP_PLAYER_DOT_SIZE / 2));
  dotTop = Math.max(MINI_MAP_PLAYER_DOT_SIZE / 2, Math.min(dotTop, mapDiameter - MINI_MAP_PLAYER_DOT_SIZE / 2));
  
  const playableAreaDiameter = (currentPlayableRadius / totalWorldRadius) * mapDiameter;

  return (
    <div
      className="absolute top-5 left-5 shadow-xl"
      style={{
        width: `${mapDiameter}px`,
        height: `${mapDiameter}px`,
        backgroundColor: MINI_MAP_BACKGROUND_COLOR,
        border: `${MINI_MAP_BORDER_THICKNESS} solid ${MINI_MAP_BORDER_COLOR}`,
        borderRadius: '50%',
        boxSizing: 'border-box',
        zIndex: 1500,
        position: 'relative',
      }}
      role="img"
      aria-label="Mini-map showing player and enemy positions in the game world"
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${playableAreaDiameter}px`,
          height: `${playableAreaDiameter}px`,
          borderRadius: '50%',
          border: '1px solid rgba(255, 0, 0, 0.5)',
          backgroundColor: 'rgba(200, 50, 50, 0.1)',
          transform: 'translate(-50%, -50%)',
          transition: 'width 100ms linear, height 100ms linear',
        }}
      />

      {aiSnakes.map(snake => {
        const head = snake.segments?.[0];
        if (!head) return null;
        const aiRelX = head.x - worldCenterX;
        const aiRelY = head.y - worldCenterY;
        const aiDotLeft = displayRadius + aiRelX * scaleFactor;
        const aiDotTop = displayRadius + aiRelY * scaleFactor;
        
        if (Math.hypot(aiDotLeft - displayRadius, aiDotTop - displayRadius) > displayRadius) return null;

        return (
          <div
            key={snake.id}
            style={{
              position: 'absolute',
              width: `${MINI_MAP_AI_DOT_SIZE}px`, height: `${MINI_MAP_AI_DOT_SIZE}px`,
              backgroundColor: MINI_MAP_AI_COLOR, borderRadius: '50%',
              left: `${aiDotLeft}px`, top: `${aiDotTop}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          width: `${MINI_MAP_PLAYER_DOT_SIZE}px`, height: `${MINI_MAP_PLAYER_DOT_SIZE}px`,
          backgroundColor: MINI_MAP_PLAYER_COLOR,
          borderRadius: '50%',
          left: `${dotLeft}px`, top: `${dotTop}px`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.7)',
        }}
        aria-label="Player position"
      />
    </div>
  );
};

export default MiniMap;