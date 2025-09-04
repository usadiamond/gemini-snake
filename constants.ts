export const GAME_WIDTH = 800; // Viewport width
export const GAME_HEIGHT = 600; // Viewport height

// Note: The following are DEFAULT values. They can be overridden by game settings.
export const DEFAULT_WORLD_RADIUS = 800; // Default radius of the circular game world
export const DEFAULT_SNAKE_SPEED = 2; // Default pixels per frame for player, adjusted for AI.
export const DEFAULT_AI_SNAKE_COUNT = 10; // Default number of AI snakes
export const DEFAULT_SHRINKING_WORLD_ENABLED = false; // Default for shrinking world feature

// Shrinking World Constants
export const MIN_WORLD_RADIUS = 150; // The smallest the world can get

// These are derived based on the current worldRadius setting in Game.tsx
// export const WORLD_CENTER_X = WORLD_RADIUS; // X-coordinate of the world's center
// export const WORLD_CENTER_Y = WORLD_RADIUS; // Y-coordinate of the world's center
// The world is a circle inscribed in a square from (0,0) to (currentWorldRadius*2, currentWorldRadius*2)

export const VIEWPORT_EXTRA_PADDING = 500; // How much extra space around the world bounding box the camera can see.

export const SEGMENT_SIZE = 12; // Diameter of a segment
export const BOOST_FACTOR = 10; // Multiplier for snake speed when boosting
export const INITIAL_SNAKE_LENGTH = 5;

export const FOOD_RADIUS = 5; // Radius of a regular food pellet
export const MAX_FOOD_ITEMS = 50; // Adjusted for smaller circular world area

export const LARGE_FOOD_VALUE = 5; // Growth value for large food
export const LARGE_FOOD_RADIUS_MULTIPLIER = 1.8; // e.g., 1.8 * FOOD_RADIUS
export const LARGE_FOOD_COLOR = 'bg-orange-400'; // Distinct color for large food
export const LARGE_FOOD_PROBABILITY = 0.3; // 30% chance to spawn large food

export const POISON_PELLET_RADIUS = 6;
export const POISON_PELLET_COLOR = 'bg-red-700';
export const POISON_PELLET_RING_COLOR = 'ring-red-900';
export const POISON_PELLET_SEGMENT_COST = 1; // Player loses 1 segment
export const MIN_SNAKE_LENGTH_TO_DROP_POISON = 4; // Needs > 3 segments (i.e., at least 4)

export const PLAYER_COLOR = 'bg-green-500';
export const AI_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
export const BOT_NICKNAMES = ['Viper', 'Serpent', 'Fury', 'Slither', 'Wraith', 'Ghost', 'Shadow', 'Cobra', 'Python'];
export const FOOD_COLORS = ['bg-red-300', 'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300']; // Regular food colors
export const GAME_TICK_MS = 20; // Affects game speed and responsiveness.
export const AI_TARGET_UPDATE_INTERVAL = 2000; // ms
export const SNAKE_TURN_SPEED = 0.1; // Radians per update for AI turning
export const PLAYER_SNAKE_TURN_SPEED = 0.15; // Radians per update for player turning. Higher is faster.

// Visuals
export const PLAY_AREA_BACKGROUND_COLOR = '#1a202c'; // Tailwind gray-900. Background for inside the world circle.
export const WORLD_BORDER_THICKNESS = '10px';
export const WORLD_BORDER_COLOR = '#C53030'; // A solid, strong red (Tailwind: red-700/800)
export const OUT_OF_BOUNDS_BG_COLOR = 'rgba(185, 28, 28, 0.3)'; // Semi-transparent red (Tailwind: bg-red-700 bg-opacity-30)

// MiniMap Constants
export const MINI_MAP_DISPLAY_RADIUS = 50; // pixels, radius of the map display
export const MINI_MAP_PLAYER_DOT_SIZE = 6; // pixels, diameter of player dot
export const MINI_MAP_BACKGROUND_COLOR = 'rgba(40, 40, 50, 0.6)'; // Semi-transparent dark blue/gray
export const MINI_MAP_BORDER_COLOR = 'rgba(150, 150, 180, 0.7)'; // Semi-transparent light gray/blue for border
export const MINI_MAP_PLAYER_COLOR = 'lime'; // Bright green for player dot
export const MINI_MAP_AI_DOT_SIZE = 4; // pixels, diameter of AI snake dots
export const MINI_MAP_AI_COLOR = '#ff4757'; // A bright red color for AI dots
export const MINI_MAP_BORDER_THICKNESS = '2px';