/**
 * Defines the core data structures for the game.
 * This ensures type safety and a consistent data model across the client and server.
 */

// Represents the result of a single letter in a guess
export type GuessResult = 'correct' | 'present' | 'absent';

// Represents a completed guess made by a player
export interface PlayerGuess {
  word: string;
  result: GuessResult[];
}

// Represents the state of a single player in the game
export interface Player {
  name: string;
  guesses: PlayerGuess[];
  score: number;
  status: 'playing' | 'won' | 'lost' | 'disconnected';
}

// Represents a single entry in the turn history for turn-based games
export interface TurnHistory {
    playerId: string;
    guess: string;
}

// Represents the entire state of a game session
export interface GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: {
    [key: string]: Player; // A map of player IDs to player state
  };
  wordLength: number;
  maxGuesses: number;
  currentPlayerId: string;
  timeLeft?: number; // Optional: Used for real-time game modes
  turnHistory: TurnHistory[]; // Optional: Used for turn-based game modes
}

// Provides a default initial state for a new game
export const initialGameState: GameState = {
  gameId: '',
  status: 'waiting',
  players: {},
  wordLength: 5,
  maxGuesses: 6,
  currentPlayerId: '',
  timeLeft: 300,
  turnHistory: [],
};
