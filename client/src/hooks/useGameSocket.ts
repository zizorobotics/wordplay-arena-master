import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { GameState } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';

// Load Supabase credentials from client-side environment variables
// Ensure you have a .env.local file in your /client directory
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in client environment variables.");
}

// Initialize the Supabase client once.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * A custom React hook to manage real-time game state synchronization
 * with a Supabase Realtime channel. It handles connecting to a specific
 * game channel, listening for state updates, and sending messages.
 *
 * @param sessionId The unique identifier for the game session to connect to.
 * @returns An object with the latest `gameState`, a function to `sendMessage`,
 * and the current `isConnected` status.
 */
export const useGameSocket = (sessionId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { user } = useAuth(); // Get the current user from the Auth context

  /**
   * Sends a message payload to all clients subscribed to the channel.
   * This is used for player actions like submitting a guess.
   */
  const sendMessage = useCallback((payload: object) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'game_update', // A consistent event name for all game messages
        payload: { ...payload, userId: user?.id }, // Attach user ID to all outgoing messages
      });
    } else {
      console.error("Cannot send message: channel is not connected.");
    }
  }, [isConnected, user?.id]);

  // Effect to manage the lifecycle of the WebSocket connection
  useEffect(() => {
    if (!sessionId || !user) return;

    // Create a new channel instance for the given session ID
    const gameChannel = supabase.channel(`game:${sessionId}`, {
      config: {
        broadcast: {
          self: true, // Receive messages sent by the same client, useful for optimistic UI
        },
      },
    });

    // Set up the listener for incoming 'game_update' events
    gameChannel
      .on('broadcast', { event: 'game_update' }, ({ payload }) => {
        console.log('Received game state update:', payload);
        // When a message is received, update the local game state
        setGameState(payload as GameState);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Once subscribed, the client is officially connected
          setIsConnected(true);
          console.log(`Successfully subscribed to channel: game:${sessionId}`);
          // Send a 'join' event so the backend can sync the initial state
          sendMessage({ action: 'player_join' });
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        } else {
          // Handle other potential statuses like 'CHANNEL_ERROR' or 'TIMED_OUT'
          console.warn(`Channel status: ${status}`);
          setIsConnected(false);
        }
      });

    // Store the channel instance in a ref to access it for cleanup
    channelRef.current = gameChannel;

    // Cleanup function: This is critical to prevent memory leaks.
    // It runs when the component unmounts.
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log(`Unsubscribed from channel: game:${sessionId}`);
      }
    };
  }, [sessionId, user, sendMessage]); // Rerun effect if sessionId or user changes

  return { gameState, sendMessage, isConnected };
};
