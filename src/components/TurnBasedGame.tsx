import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Zap, Loader2, RefreshCw } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { GameState, initialGameState, GuessResult } from "@/types/game";
// This is a placeholder for a custom hook that will manage the WebSocket connection.
import { useGameSocket } from "@/hooks/useGameSocket";

const TurnBasedGame = ({ wordLength, onBack, sessionId, currentUserId }: { wordLength: number; onBack: () => void; sessionId: string, currentUserId: string }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const { toast } = useToast();
  const { currentTheme, isTransitioning } = useTheme();

  const { gameState: wsGameState, sendMessage, isConnected } = useGameSocket(sessionId);

  // Use WebSocket connection
  useEffect(() => {
    if (wsGameState) {
      setGameState(wsGameState);
      setIsConnecting(false);
    }
  }, [wsGameState]);

  useEffect(() => {
    if (isConnected && !isConnecting) {
      toast({ title: "Connected!", description: "It's your turn to guess." });
    }
  }, [isConnected, isConnecting, toast]);

  // WebSocket message handling is now done through useGameSocket hook

  const handleKeyPress = (key: string) => {
    if (!gameState || gameState.status !== 'playing' || gameState.currentPlayerId !== currentUserId || isSubmitting) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < wordLength) {
        setCurrentGuess(prev => prev + key.toUpperCase());
      }
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== wordLength) {
      toast({ title: "Invalid guess", description: `Word must be ${wordLength} letters long`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      action: 'submit_turn_guess',
      guess: currentGuess,
      playerId: currentUserId
    };
    sendMessage(payload);
    
    // Clear input immediately for better UX
        setCurrentGuess("");
    // The actual state update will come from WebSocket
    setTimeout(() => setIsSubmitting(false), 1000);
  };
  
  const isMyTurn = gameState.currentPlayerId === currentUserId;

  const renderTile = (letter: string, result: GuessResult | undefined, index: number) => {
    let bgColor = currentTheme.colors.empty;
    let textColor = 'text-gray-800';

    switch (result) {
        case 'correct': bgColor = currentTheme.colors.correct; textColor = 'text-white'; break;
        case 'present': bgColor = currentTheme.colors.present; textColor = 'text-white'; break;
        case 'absent': bgColor = currentTheme.colors.absent; textColor = 'text-white'; break;
        default: if(letter) { bgColor = currentTheme.colors.current; textColor = 'text-blue-800' };
    }

    return (
      <div key={index} className={`w-12 h-12 border-2 flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-300 ${bgColor} ${textColor}`}>
        {letter}
      </div>
    );
  };

  const renderPlayerBoard = (playerId: string) => {
      const player = gameState.players[playerId];
      if (!player) return null;
      const displayGuesses = Array.from({ length: gameState.maxGuesses });

      return (
        <div className="flex flex-col items-center gap-2">
            {displayGuesses.map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                    {Array.from({ length: gameState.wordLength }).map((_, colIndex) => {
                        const guessData = player.guesses[rowIndex];
                        const letter = guessData ? guessData.word[colIndex] : (playerId === currentUserId && isMyTurn && rowIndex === player.guesses.length ? currentGuess[colIndex] : '') || '';
                        const result = guessData ? guessData.result[colIndex] : undefined;
                        return renderTile(letter, result, colIndex);
                    })}
                </div>
            ))}
        </div>
      )
  };

  if (isConnecting) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${currentTheme.background}`}>
            <Loader2 className="w-16 h-16 text-white animate-spin" />
            <p className="text-white text-2xl ml-4">Loading Game...</p>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4`}>
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={onBack} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leave
                </Button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">1v1 Turn-Based</h1>
                    {gameState.status !== 'playing' && <div className="text-xl text-yellow-300">Game Over!</div>}
                </div>
                 <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Game Boards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Player 1 (You) */}
                <Card className={`bg-white/95 border-2 shadow-xl ${isMyTurn ? 'border-blue-500 ring-4 ring-blue-500/50' : 'border-transparent'}`}>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-xl text-gray-800">You</CardTitle>
                        <div className="text-center">
                           <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                                <Zap className="w-5 h-5" />
                                {gameState.players[currentUserId]?.score || 0}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">{renderPlayerBoard(currentUserId)}</CardContent>
                </Card>
                
                {/* Game Info */}
                <Card className="bg-white/95 border-0 shadow-xl">
                     <CardHeader>
                        <CardTitle className="text-center text-lg">
                           {isMyTurn ? "Your Turn" : "Opponent's Turn"} 
                           {!isMyTurn && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-center">
                       <p className="text-gray-600">Guess the {wordLength}-letter word. You can see your opponent's guesses after their turn.</p>
                       <div className="mt-4">
                            <h3 className="font-bold mb-2">Game History</h3>
                            <div className="space-y-1 text-sm text-left">
                                {gameState.turnHistory.map((turn, i) => (
                                    <div key={i} className="p-1 bg-gray-100 rounded">
                                        <strong>{gameState.players[turn.playerId]?.name}:</strong> "{turn.guess}"
                                    </div>
                                ))}
                            </div>
                       </div>
                    </CardContent>
                </Card>

                {/* Player 2 (Opponent) */}
                <Card className={`bg-white/95 border-2 shadow-xl ${!isMyTurn ? 'border-red-500 ring-4 ring-red-500/50' : 'border-transparent'}`}>
                    <CardHeader className="pb-4">
                         <CardTitle className="text-center text-xl text-gray-800">Opponent</CardTitle>
                         <div className="text-center">
                           <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                                <Zap className="w-5 h-5" />
                                {gameState.players[Object.keys(gameState.players).find(id => id !== currentUserId) || '']?.score || 0}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {renderPlayerBoard(Object.keys(gameState.players).find(id => id !== currentUserId) || '')}
                    </CardContent>
                </Card>
            </div>
            
            {/* Keyboard */}
            <div className="max-w-2xl mx-auto">
                 <VirtualKeyboard onKeyPress={handleKeyPress} usedLetters={{}} disabled={!isMyTurn || isSubmitting || gameState.status !== 'playing'}/>
            </div>
        </div>
    </div>
  );
};

export default TurnBasedGame;
