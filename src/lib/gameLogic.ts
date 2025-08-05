/**
 * This file is responsible for all client-side interactions with the game logic API.
 * Instead of containing the logic itself (like word lists or guess checking),
 * it makes fetch requests to the backend, which is the single source of truth.
 */

// In a real application, this would come from an environment variable
const API_BASE_URL = "http://localhost:8085/api/v1"; 

/**
 * Fetches a new random word from the backend for a given game session.
 * @param length The desired length of the word.
 * @param sessionId A unique identifier for the game session to prevent cheating.
 * @returns The session ID and word length. The actual word is kept on the server.
 */
export const startNewGame = async (length: number, sessionId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // This endpoint would initialize a new game state on the backend
    const response = await fetch(`${API_BASE_URL}/games/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ length, sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start a new game.');
    }

    // The backend confirms the game is created. The client doesn't need the target word.
    return { success: true, message: 'Game started successfully' };
  } catch (error) {
    console.error("Error starting new game:", error);
    return { success: false, message: (error as Error).message };
  }
};

/**
 * Submits a guess to the backend for validation.
 * @param guess The word the user is guessing.
 * @param sessionId The unique ID for the current game session.
 * @returns An array of results for each letter: 'correct', 'present', or 'absent'.
 */
export const checkGuess = async (guess: string, sessionId: string): Promise<('correct' | 'present' | 'absent')[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${sessionId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid guess or word.');
    }

    const data = await response.json();
    return data.result; // The backend returns the validated result array
  } catch (error) {
    console.error("Error checking guess:", error);
    // Return an empty array or handle error appropriately in the component
    throw error;
  }
};

/**
 * Asks the backend if a word is valid and exists in the dictionary.
 * This is a lighter-weight check than submitting a full guess.
 * @param word The word to validate.
 * @returns A boolean indicating if the word is valid.
 */
export const isValidWord = async (word: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate_guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      return false; // If the request fails, assume the word is invalid.
    }
    
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error("Error validating word:", error);
    return false;
  }
};
