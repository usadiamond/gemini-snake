import { useEffect, useRef, useCallback } from 'react';

const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean, tickRate: number) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef(0);
  const lastTickTimeRef = useRef(0);

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current === 0) previousTimeRef.current = time; // Initialize on first frame
    lastTickTimeRef.current = lastTickTimeRef.current || time; // Initialize lastTickTime on first run or when resuming

    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    if (time - lastTickTimeRef.current >= tickRate) {
      callback(deltaTime); // Pass actual deltaTime, though game logic might be tick-based
      lastTickTimeRef.current = time - ((time - lastTickTimeRef.current) % tickRate); // Align next tick
    }
    
    requestRef.current = requestAnimationFrame(loop);
  }, [callback, tickRate]);

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = 0; // Reset time to avoid large deltaTime jump if paused
      lastTickTimeRef.current = 0; // Reset last tick time
      requestRef.current = requestAnimationFrame(loop);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
  }, [isRunning, loop]);
};

export default useGameLoop;