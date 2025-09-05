import React, { useState, useEffect, useCallback, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, onDisconnect, off } from 'firebase/database';
import { Point, Snake, Food, SnakeSegment, PoisonPellet, GameSettings } from '../types';
import {
  GAME_WIDTH, 
  GAME_HEIGHT, 
  SEGMENT_SIZE,
  BOOST_FACTOR, 
  INITIAL_SNAKE_LENGTH,
  FOOD_RADIUS,
  MAX_FOOD_ITEMS,
  PLAYER_COLOR,
  AI_COLORS,
  BOT_NICKNAMES,
  FOOD_COLORS,
  GAME_TICK_MS,
  AI_TARGET_UPDATE_INTERVAL,
  SNAKE_TURN_SPEED,
  PLAYER_SNAKE_TURN_SPEED,
  LARGE_FOOD_VALUE,
  LARGE_FOOD_RADIUS_MULTIPLIER,
  LARGE_FOOD_COLOR,
  LARGE_FOOD_PROBABILITY,
  POISON_PELLET_RADIUS,
  POISON_PELLET_COLOR,
  POISON_PELLET_RING_COLOR,
  POISON_PELLET_SEGMENT_COST,
  MIN_SNAKE_LENGTH_TO_DROP_POISON,
  WORLD_BORDER_THICKNESS,
  WORLD_BORDER_COLOR,
  PLAY_AREA_BACKGROUND_COLOR,
  MINI_MAP_DISPLAY_RADIUS,
  MIN_WORLD_RADIUS,
} from '../constants';
import useGameLoop from '../hooks/useGameLoop';
import MiniMap from './MiniMap';
import Leaderboard from './Leaderboard';

interface GameProps {
  onGameOver: (score: number) => void;
  gameSettings: GameSettings;
  playerNickname: string;
}

const getFoodPointsFromSnake = (deadSnake: Snake): Point[] => {
  const foodFromSnake: Point[] = [];
  deadSnake.segments.forEach((seg, index) => {
    if (index % 2 === 0) { 
      foodFromSnake.push({ x: seg.x, y: seg.y }); 
    }
  });
  return foodFromSnake;
};

// Generate a unique ID for the player for this session
const playerId = `player-${Math.random().toString(36).substr(2, 9)}`;

const Game: React.FC<GameProps> = ({ onGameOver, gameSettings, playerNickname }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const mousePositionRef = useRef<Point>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const aiTargetUpdateTimers = useRef<number[]>([]);
  const borderThicknessNum = parseFloat(WORLD_BORDER_THICKNESS);

  const [networkSnakes, setNetworkSnakes] = useState<Record<string, Snake>>({});

  const gameStateRef = useRef({
    playerSnake: null as Snake | null,
    aiSnakes: [] as Snake[],
    foodItems: [] as Food[],
    poisonPellets: [] as PoisonPellet[],
    leaderboard: [] as {id: string, nickname: string, score: number}[],
    isGameRunning: false,
    viewportOffset: { x: 0, y: 0 },
    dynamicWorldRadius: gameSettings.worldRadius,
    worldCenterX: gameSettings.worldRadius,
    worldCenterY: gameSettings.worldRadius,
    shrinkRatePerSecond: 0,
  });

  const [renderTrigger, setRenderTrigger] = useState(0);

  const createInitialPlayerSnake = useCallback((nickname: string, worldCenterX: number, worldCenterY: number): Snake => {
    const segments: SnakeSegment[] = [];
    const timestamp = Date.now();
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      segments.push({ id: `${playerId}-seg-${timestamp}-${i}`, x: worldCenterX - i * SEGMENT_SIZE, y: worldCenterY });
    }
    return { id: playerId, nickname, segments, color: PLAYER_COLOR, isPlayer: true, direction: { x: 1, y: 0 }, nextGrowth: 0, score: 0 };
  }, []);
  
  // Firebase setup
  useEffect(() => {
    const allPlayersRef = ref(database, 'players');
    
    const onPlayerData = (snapshot: any) => {
        const playersData = snapshot.val() || {};
        delete playersData[playerId]; // Don't include our own snake
        setNetworkSnakes(playersData);
    };

    onValue(allPlayersRef, onPlayerData);

    // Set up the disconnect handler
    const playerRef = ref(database, `players/${playerId}`);
    onDisconnect(playerRef).remove();

    return () => {
      off(allPlayersRef, 'value', onPlayerData);
      const playerRef = ref(database, `players/${playerId}`);
      set(playerRef, null); // Clean up on unmount
    };
  }, []);


  const createAISnake = useCallback((idSuffix: number | string, worldRadius: number, worldCenterX: number, worldCenterY: number): Snake => {
    const segments: SnakeSegment[] = [];
    const angle = Math.random() * 2 * Math.PI;
    const minSpawnRadius = worldRadius * 0.5;
    const maxSpawnRadius = worldRadius - (SEGMENT_SIZE * INITIAL_SNAKE_LENGTH);
    const spawnRadius = minSpawnRadius + (maxSpawnRadius - minSpawnRadius) * Math.random();
    const startX = worldCenterX + spawnRadius * Math.cos(angle);
    const startY = worldCenterY + spawnRadius * Math.sin(angle);
    const timestamp = Date.now();

    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      segments.push({ id: `ai-${idSuffix}-${timestamp}-${i}`, x: startX - i * SEGMENT_SIZE * Math.cos(angle), y: startY - i * SEGMENT_SIZE * Math.sin(angle) });
    }
    const initialAngle = Math.random() * 2 * Math.PI;
    const nickname = `${BOT_NICKNAMES[Math.floor(Math.random() * BOT_NICKNAMES.length)]} ${Math.floor(Math.random() * 1000)}`;
    return {
      id: `ai-${idSuffix}-${timestamp}`,
      nickname,
      segments,
      color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)],
      isPlayer: false,
      direction: { x: Math.cos(initialAngle), y: Math.sin(initialAngle) },
      targetDirection: { x: Math.cos(initialAngle), y: Math.sin(initialAngle) },
      nextGrowth: 0,
      score: 0,
    };
  }, []);

  const spawnNewFoodItems = useCallback((
    count: number = 1, 
    specificPoints?: Point[], 
    dynamicWorldRadius?: number, 
    worldCenterX?: number, 
    worldCenterY?: number
  ): Food[] => {
    const newFood: Food[] = [];
    const foodSpawnPadding = FOOD_RADIUS * LARGE_FOOD_RADIUS_MULTIPLIER + borderThicknessNum + 5;
    const currentRadius = dynamicWorldRadius ?? gameStateRef.current.dynamicWorldRadius;
    const centerX = worldCenterX ?? gameStateRef.current.worldCenterX;
    const centerY = worldCenterY ?? gameStateRef.current.worldCenterY;
    
    const pointsToSpawn = specificPoints 
      ? specificPoints.map(p => ({ point: p, isSpecific: true })) 
      : Array(count).fill(null).map(() => {
          const angle = Math.random() * 2 * Math.PI;
          const maxR = currentRadius - foodSpawnPadding;
          const r = maxR > 0 ? maxR * Math.sqrt(Math.random()) : 0;
          return {
            point: { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) },
            isSpecific: false
          };
        });

    for (const { point, isSpecific } of pointsToSpawn) {
      const isLargeFood = !isSpecific && Math.random() < LARGE_FOOD_PROBABILITY;
      newFood.push({
        id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: point, 
        color: isLargeFood ? LARGE_FOOD_COLOR : FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
        value: isLargeFood ? LARGE_FOOD_VALUE : 1,
      });
    }
    return newFood;
  }, [borderThicknessNum]);

  useEffect(() => {
    const { worldRadius, aiSnakeCount, shrinkingWorldEnabled } = gameSettings;
    const state = gameStateRef.current;
    state.worldCenterX = worldRadius;
    state.worldCenterY = worldRadius;
    state.dynamicWorldRadius = worldRadius;
    state.shrinkRatePerSecond = shrinkingWorldEnabled ? (worldRadius - MIN_WORLD_RADIUS) / 20 : 0;
    state.playerSnake = createInitialPlayerSnake(playerNickname, state.worldCenterX, state.worldCenterY);
    state.aiSnakes = Array.from({ length: aiSnakeCount }, (_, i) => createAISnake(i, worldRadius, state.worldCenterX, state.worldCenterY));
    state.foodItems = spawnNewFoodItems(MAX_FOOD_ITEMS, undefined, worldRadius, state.worldCenterX, state.worldCenterY);
    state.poisonPellets = [];
    const head = state.playerSnake.segments[0];
    state.viewportOffset = { x: head.x - GAME_WIDTH / 2, y: head.y - GAME_HEIGHT / 2 };
    state.isGameRunning = true;
    setRenderTrigger(t => t + 1);
  }, [gameSettings, playerNickname, createInitialPlayerSnake, createAISnake, spawnNewFoodItems]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        mousePositionRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => { if (event.button === 0) setIsBoosting(true); };
    const handleMouseUp = (event: MouseEvent) => { if (event.button === 0) setIsBoosting(false); };
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault(); 
      const state = gameStateRef.current;
      if (state.isGameRunning && state.playerSnake && state.playerSnake.segments.length > MIN_SNAKE_LENGTH_TO_DROP_POISON) {
          const newSegments = state.playerSnake.segments.slice(0, state.playerSnake.segments.length - POISON_PELLET_SEGMENT_COST);
          const droppedSegmentPosition = state.playerSnake.segments[state.playerSnake.segments.length - POISON_PELLET_SEGMENT_COST];
          if (droppedSegmentPosition) {
              const distToCenter = Math.hypot(droppedSegmentPosition.x - state.worldCenterX, droppedSegmentPosition.y - state.worldCenterY);
              if (distToCenter + POISON_PELLET_RADIUS < state.dynamicWorldRadius - borderThicknessNum) {
                  state.poisonPellets.push({
                      id: `poison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      position: { ...droppedSegmentPosition },
                      color: POISON_PELLET_COLOR, ringColor: POISON_PELLET_RING_COLOR, radius: POISON_PELLET_RADIUS,
                  });
              }
          }
          state.playerSnake = { ...state.playerSnake, segments: newSegments };
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [borderThicknessNum]);

  const updateSnakePosition = useCallback((snake: Snake, isPlayerControl: boolean, mouseWorldPos: Point, isCurrentlyBoosting?: boolean ): Snake => {
      const { snakeSpeed } = gameSettings;
      const oldSegments = snake.segments;
      if (oldSegments.length === 0) return snake; 
      const oldHead = oldSegments[0];
      let newHeadX, newHeadY;
      let finalUpdatedDirection = { ...snake.direction };
      let currentBaseSpeed = snakeSpeed;

      if (isPlayerControl && isCurrentlyBoosting) currentBaseSpeed *= BOOST_FACTOR;

      if (isPlayerControl) {
          const dx = mouseWorldPos.x - oldHead.x;
          const dy = mouseWorldPos.y - oldHead.y;
          const distance = Math.hypot(dx, dy);

          if (distance < SEGMENT_SIZE / 2) {
              const currentDir = snake.direction;
              newHeadX = oldHead.x + currentDir.x * currentBaseSpeed;
              newHeadY = oldHead.y + currentDir.y * currentBaseSpeed;
              finalUpdatedDirection = currentDir;
          } else {
              const targetDir = { x: dx / distance, y: dy / distance };
              let currentAngle = Math.atan2(snake.direction.y, snake.direction.x);
              let targetAngle = Math.atan2(targetDir.y, targetDir.x);
              let angleDiff = targetAngle - currentAngle;
              while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
              while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

              if (Math.abs(angleDiff) < PLAYER_SNAKE_TURN_SPEED) {
                  currentAngle = targetAngle;
              } else {
                  currentAngle += Math.sign(angleDiff) * PLAYER_SNAKE_TURN_SPEED;
              }
              finalUpdatedDirection = { x: Math.cos(currentAngle), y: Math.sin(currentAngle) };
              newHeadX = oldHead.x + finalUpdatedDirection.x * currentBaseSpeed;
              newHeadY = oldHead.y + finalUpdatedDirection.y * currentBaseSpeed;
          }
      } else {
          let currentAngle = Math.atan2(snake.direction.y, snake.direction.x);
          const targetDir = snake.targetDirection || snake.direction;
          let targetAngle = Math.atan2(targetDir.y, targetDir.x);
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

          if (Math.abs(angleDiff) < SNAKE_TURN_SPEED) {
              currentAngle = targetAngle;
          } else {
              currentAngle += Math.sign(angleDiff) * SNAKE_TURN_SPEED;
          }
          finalUpdatedDirection = {x: Math.cos(currentAngle), y: Math.sin(currentAngle)};
          newHeadX = oldHead.x + finalUpdatedDirection.x * currentBaseSpeed;
          newHeadY = oldHead.y + finalUpdatedDirection.y * currentBaseSpeed;
      }

      const newSegmentsArray = oldSegments.map(seg => ({ ...seg }));

      for (let i = newSegmentsArray.length - 1; i > 0; i--) {
          newSegmentsArray[i].x = newSegmentsArray[i-1].x;
          newSegmentsArray[i].y = newSegmentsArray[i-1].y;
      }
      if (newSegmentsArray.length > 0) {
          newSegmentsArray[0].x = newHeadX;
          newSegmentsArray[0].y = newHeadY;
      }

      let growthApplied = 0;
      if (snake.nextGrowth > 0) {
          const tail = newSegmentsArray[newSegmentsArray.length - 1] || oldHead;
          for (let i = 0; i < snake.nextGrowth; i++) {
              newSegmentsArray.push({ ...tail, id: `${snake.id}-g-${Date.now()}-${i}` });
          }
          growthApplied = snake.nextGrowth;
      }
      return { ...snake, segments: newSegmentsArray, nextGrowth: snake.nextGrowth - growthApplied, direction: finalUpdatedDirection };
  }, [gameSettings]);

  const checkCollision = useCallback((snake: Snake, allSnakes: Snake[]): boolean => {
    if (!snake || snake.segments.length === 0) return false;
    const { dynamicWorldRadius, worldCenterX, worldCenterY } = gameStateRef.current;
    const head = snake.segments[0]; 
    const headRadius = SEGMENT_SIZE / 2;
    if (Math.hypot(head.x - worldCenterX, head.y - worldCenterY) + headRadius > dynamicWorldRadius - borderThicknessNum) return true; 
    for (const other of allSnakes) {
      if (!other || !other.segments || other.id === snake.id) continue;
      // Network snakes may not have a full segment list sometimes during sync
      const lethalSegments = other.segments.slice(1);
      for (const seg of lethalSegments) {
        if (Math.hypot(head.x - seg.x, head.y - seg.y) < SEGMENT_SIZE) return true;
      }
    }
    return false;
  }, [borderThicknessNum]);
  
  useEffect(() => {
    aiTargetUpdateTimers.current.forEach(clearTimeout);
    aiTargetUpdateTimers.current = [];
    const state = gameStateRef.current;
    if (state.isGameRunning && state.aiSnakes.length > 0) {
        state.aiSnakes.forEach(aiSnakeInstance => {
            if (!aiSnakeInstance || !aiSnakeInstance.id) return;
            const updateLogic = () => {
              const currentState = gameStateRef.current;
              const liveSnake = currentState.aiSnakes.find(s => s.id === aiSnakeInstance.id);
              if (!liveSnake || !currentState.playerSnake) return;

              const aiHead = liveSnake.segments[0];
              const playerHead = currentState.playerSnake.segments[0];
              if (Math.hypot(aiHead.x - currentState.worldCenterX, aiHead.y - currentState.worldCenterY) > currentState.dynamicWorldRadius * 0.85) {
                liveSnake.targetDirection = { x: currentState.worldCenterX - aiHead.x, y: currentState.worldCenterY - aiHead.y };
              } else {
                  const leadFactor = Math.min(Math.hypot(aiHead.x - playerHead.x, aiHead.y - playerHead.y), gameSettings.snakeSpeed * 40);
                  const targetX = playerHead.x + currentState.playerSnake.direction.x * leadFactor;
                  const targetY = playerHead.y + currentState.playerSnake.direction.y * leadFactor;
                  liveSnake.targetDirection = { x: targetX - aiHead.x, y: targetY - aiHead.y };
              }
              const nextTimerId = window.setTimeout(updateLogic, AI_TARGET_UPDATE_INTERVAL * (0.75 + Math.random() * 0.5));
              aiTargetUpdateTimers.current.push(nextTimerId);
            };
            aiTargetUpdateTimers.current.push(window.setTimeout(updateLogic, Math.random() * AI_TARGET_UPDATE_INTERVAL));
        });
    }
    return () => {
      aiTargetUpdateTimers.current.forEach(clearTimeout);
      aiTargetUpdateTimers.current = [];
    };
  }, [gameSettings.aiSnakeCount, gameSettings.snakeSpeed, gameStateRef.current.isGameRunning]);

  const gameTick = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;
    if (!state.isGameRunning || !state.playerSnake) return;

    // Update player data in Firebase
    const playerRef = ref(database, `players/${playerId}`);
    set(playerRef, state.playerSnake);

    if (gameSettings.shrinkingWorldEnabled && state.dynamicWorldRadius > MIN_WORLD_RADIUS) {
        const shrinkAmount = state.shrinkRatePerSecond * (deltaTime / 1000);
        state.dynamicWorldRadius = Math.max(MIN_WORLD_RADIUS, state.dynamicWorldRadius - shrinkAmount);
    }
    
    const mouseWorldPos = { x: mousePositionRef.current.x + state.viewportOffset.x, y: mousePositionRef.current.y + state.viewportOffset.y };
    state.playerSnake = updateSnakePosition(state.playerSnake, true, mouseWorldPos, isBoosting);
    
    if (state.playerSnake.segments.length > 0) {
        const playerHead = state.playerSnake.segments[0];
        state.viewportOffset.x = playerHead.x - GAME_WIDTH / 2;
        state.viewportOffset.y = playerHead.y - GAME_HEIGHT / 2;
    }
    
    state.foodItems = state.foodItems.filter(food => {
        const head = state.playerSnake.segments[0];
        const radius = food.value === LARGE_FOOD_VALUE ? FOOD_RADIUS * LARGE_FOOD_RADIUS_MULTIPLIER : FOOD_RADIUS;
        if (Math.hypot(head.x - food.position.x, head.y - food.position.y) < (SEGMENT_SIZE / 2) + radius) {
            state.playerSnake.score += food.value * 10;
            state.playerSnake.nextGrowth += food.value;
            return false;
        }
        return true;
    });

    const foodEatenByAI = new Set<string>();
    state.aiSnakes = state.aiSnakes.map(ai => {
        const updatedAI = updateSnakePosition(ai, false, {x:0, y:0});
        state.foodItems.forEach(food => {
            if(foodEatenByAI.has(food.id)) return;
            const head = updatedAI.segments[0];
            const radius = food.value === LARGE_FOOD_VALUE ? FOOD_RADIUS * LARGE_FOOD_RADIUS_MULTIPLIER : FOOD_RADIUS;
            if (Math.hypot(head.x - food.position.x, head.y - food.position.y) < (SEGMENT_SIZE / 2) + radius) {
                updatedAI.score += food.value * 10;
                updatedAI.nextGrowth += food.value;
                foodEatenByAI.add(food.id);
            }
        });
        return updatedAI;
    });
    state.foodItems = state.foodItems.filter(f => !foodEatenByAI.has(f.id));

    const allSnakes = [state.playerSnake, ...state.aiSnakes, ...Object.values(networkSnakes)];
    if (checkCollision(state.playerSnake, allSnakes)) {
        state.foodItems.push(...spawnNewFoodItems(0, getFoodPointsFromSnake(state.playerSnake)));
        state.isGameRunning = false;
        onGameOver(state.playerSnake.score);
        set(playerRef, null); // Remove player from DB on death
        return;
    }

    const survivingAIs: Snake[] = [];
    state.aiSnakes.forEach(ai => {
        let isDead = checkCollision(ai, allSnakes);
        if (!isDead) {
          for (const pellet of state.poisonPellets) {
            if (Math.hypot(ai.segments[0].x - pellet.position.x, ai.segments[0].y - pellet.position.y) < (SEGMENT_SIZE/2) + pellet.radius) {
              isDead = true;
              state.poisonPellets = state.poisonPellets.filter(p => p.id !== pellet.id);
              break;
            }
          }
        }
        if (isDead) {
          state.foodItems.push(...spawnNewFoodItems(0, getFoodPointsFromSnake(ai)));
        } else {
          survivingAIs.push(ai);
        }
    });
    state.aiSnakes = survivingAIs;

    if (state.foodItems.length < MAX_FOOD_ITEMS) state.foodItems.push(...spawnNewFoodItems(1));
    
    state.leaderboard = allSnakes
      .filter(s => s && s.id) // Filter out any null/undefined snakes
      .map(s => ({ id: s.id, nickname: s.nickname, score: s.score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      
    setRenderTrigger(t => t + 1);
  }, [ isBoosting, updateSnakePosition, checkCollision, onGameOver, spawnNewFoodItems, gameSettings, networkSnakes ]);

  useGameLoop(gameTick, gameStateRef.current.isGameRunning, GAME_TICK_MS);
  
  const state = gameStateRef.current;
  if (!state.isGameRunning || !state.playerSnake) return null; 

  const snakesToRender = [state.playerSnake, ...state.aiSnakes, ...Object.values(networkSnakes)];

  return (
    <div 
        ref={gameAreaRef} 
        className="w-full h-full relative overflow-hidden shadow-inner"
        style={{cursor: 'none'}}
        role="application" 
        aria-label="Slither Fury Game Arena"
    >
      <div
        style={{
          position: 'absolute',
          left: `${Math.round(state.worldCenterX - state.dynamicWorldRadius - state.viewportOffset.x)}px`,
          top: `${Math.round(state.worldCenterY - state.dynamicWorldRadius - state.viewportOffset.y)}px`,
          width: `${state.dynamicWorldRadius * 2}px`,
          height: `${state.dynamicWorldRadius * 2}px`,
          borderRadius: '50%',
          backgroundColor: PLAY_AREA_BACKGROUND_COLOR, 
          border: `${WORLD_BORDER_THICKNESS} solid ${WORLD_BORDER_COLOR}`,
          boxSizing: 'border-box',
        }}
      />

      {state.foodItems.map(food => {
        const isLarge = food.value === LARGE_FOOD_VALUE;
        const radius = isLarge ? FOOD_RADIUS * LARGE_FOOD_RADIUS_MULTIPLIER : FOOD_RADIUS;
        return (
          <div
            key={food.id}
            className={`absolute rounded-full ${food.color}`}
            style={{
              width: `${radius * 2}px`, height: `${radius * 2}px`,
              left: `${Math.round(food.position.x - state.viewportOffset.x)}px`, 
              top: `${Math.round(food.position.y - state.viewportOffset.y)}px`,  
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {state.poisonPellets.map(pellet => (
        <div
          key={pellet.id}
          className={`absolute rounded-full ${pellet.color} ring-2 ${pellet.ringColor}`}
          style={{
            width: `${pellet.radius * 2}px`, height: `${pellet.radius * 2}px`,
            left: `${Math.round(pellet.position.x - state.viewportOffset.x)}px`,
            top: `${Math.round(pellet.position.y - state.viewportOffset.y)}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {snakesToRender.map(snake => {
        if (!snake || !snake.segments || snake.id === playerId) return null; // Don't render player here
        return snake.segments.map((segment, index) => (
          <div
            key={segment.id}
            className={`absolute rounded-full ${snake.color} ${index === 0 ? 'border-2 border-gray-400' : ''}`}
            style={{
              width: `${SEGMENT_SIZE}px`, height: `${SEGMENT_SIZE}px`,
              left: `${Math.round(segment.x - state.viewportOffset.x)}px`, 
              top: `${Math.round(segment.y - state.viewportOffset.y)}px`,  
              transform: 'translate(-50%, -50%)',
              zIndex: snake.segments.length - index + 10, 
            }}
          />
        ));
      })}

      {state.playerSnake.segments.map((segment, index) => (
        <div
          key={segment.id}
          className={`absolute rounded-full ${state.playerSnake.color} ${index === 0 ? 'ring-2 ring-yellow-300 border-2 border-black' : ''}`}
          style={{
            width: `${SEGMENT_SIZE}px`, height: `${SEGMENT_SIZE}px`,
            left: `${Math.round(segment.x - state.viewportOffset.x)}px`, 
            top: `${Math.round(segment.y - state.viewportOffset.y)}px`,  
            transform: 'translate(-50%, -50%)',
            zIndex: 100 + state.playerSnake.segments.length - index, 
          }}
        />
      ))}

      <Leaderboard players={state.leaderboard} playerId={state.playerSnake.id} />

      <MiniMap
        totalWorldRadius={gameSettings.worldRadius}
        currentPlayableRadius={state.dynamicWorldRadius}
        worldCenterX={state.worldCenterX}
        worldCenterY={state.worldCenterY}
        playerWorldPos={state.playerSnake.segments[0]}
        aiSnakes={[...state.aiSnakes, ...Object.values(networkSnakes).filter(s => s.id !== playerId)]}
        displayRadius={MINI_MAP_DISPLAY_RADIUS}
      />
      
      <div 
          className="absolute rounded-full bg-white opacity-50 pointer-events-none"
          style={{
              width: '8px', height: '8px',
              left: `${mousePositionRef.current.x}px`, 
              top: `${mousePositionRef.current.y}px`, 
              transform: 'translate(-50%, -50%)',
              zIndex: 2001, 
          }}
      />
    </div>
  );
};

export default Game;