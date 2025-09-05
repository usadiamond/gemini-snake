export interface Point {
  x: number;
  y: number;
}

export interface SnakeSegment extends Point {
  id: string; // Unique ID for React key
}

export interface Snake {
  id:string;
  nickname: string;
  segments: SnakeSegment[];
  color: string;
  isPlayer: boolean;
  direction: Point; // For AI snakes mostly
  targetDirection?: Point; // For smoother AI turning
  nextGrowth: number; // Segments to add on next food
  score: number;
}

export interface Food {
  id: string;
  position: Point;
  color: string;
  value: number; // Growth value; can be > 1 for special food types, or indicative of type.
}

export interface PoisonPellet {
  id: string;
  position: Point;
  color: string;
  radius: number;
  ringColor: string;
}

export enum GameState {
  StartScreen,
  Playing,
  GameOver,
  Settings, // Potentially for future use if settings are not a modal
}

export interface GameSettings {
  snakeSpeed: number;
  worldRadius: number;
  aiSnakeCount: number;
  shrinkingWorldEnabled: boolean;
}