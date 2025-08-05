import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '@/types/game';

/**
 * A custom React hook to manage real-time game state synchronization.
 * For now, this is a mock implementation that simulates WebSocket behavior.
 * In a real implementation, this would connect to Supabase Realtime channels.
 *
 * @param sessionId The unique identifier for the game session to connect to.
 * @returns An object with the latest `gameState`, a function to `sendMessage`,
 * and the current `isConnected` status.
 */
export const useGameSocket = (sessionId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Sends a message payload. In a real implementation, this would broadcast
   * to a Supabase Realtime channel.
   */
  const sendMessage = useCallback((payload: object) => {
    console.log('Mock WebSocket message sent:', payload);
    
    // Simulate server processing and response
    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current);
    }
    
    mockTimeoutRef.current = setTimeout(() => {
      // Mock game state update based on the payload
      if (payload && typeof payload === 'object' && 'action' in payload) {
        const action = (payload as { action: string }).action;
        
        if (action === 'submit_guess') {
          // Simulate a guess being processed
          setGameState(prev => {
            if (!prev) return prev;
            
            const newState = { ...prev };
            const playerId = (payload as { playerId?: string }).playerId || 'player1';
            const guess = (payload as { guess?: string }).guess || '';
            
            if (newState.players[playerId]) {
              newState.players[playerId].guesses.push({
                word: guess,
                result: ['present', 'absent', 'correct', 'present', 'absent'] // Mock result
              });
            }
            
            return newState;
          });
    }
      }
    }, 1000);
  }, []);

  // Effect to manage the mock connection lifecycle
  useEffect(() => {
    if (!sessionId) return;

    console.log(`Mock connecting to game session: ${sessionId}`);
    
    // Simulate connection delay
    const connectionTimeout = setTimeout(() => {
      setIsConnected(true);
      
      // Initialize mock game state
      setGameState({
        gameId: sessionId,
        status: 'playing',
        players: {
          'player1': { name: 'You', guesses: [], score: 0, status: 'playing' },
          'player2': { name: 'Opponent', guesses: [], score: 0, status: 'playing' }
        },
        wordLength: 5,
        maxGuesses: 6,
        currentPlayerId: 'player1',
        timeLeft: 300,
        turnHistory: [],
      });
      
      console.log(`Mock connected to channel: game:${sessionId}`);
    }, 1500);

    // Cleanup function
    return () => {
      clearTimeout(connectionTimeout);
      if (mockTimeoutRef.current) {
        clearTimeout(mockTimeoutRef.current);
      }
      setIsConnected(false);
      setGameState(null);
      console.log(`Mock disconnected from channel: game:${sessionId}`);
    };
  }, [sessionId]);

  return { gameState, sendMessage, isConnected };
};
