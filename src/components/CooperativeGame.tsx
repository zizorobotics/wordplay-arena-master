import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Loader2, RefreshCw } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { GameState, initialGameState, GuessResult } from "@/types/game";
import { useGameSocket } from "@/hooks/useGameSocket";

const CooperativeGame = ({ wordLength, onBack, sessionId, currentUserId }: { wordLength: number; onBack: () => void; sessionId: string, currentUserId: string }) => {
  const { gameState: wsGameState, sendMessage, isConnected } = useGameSocket(sessionId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const { toast } = useToast();
  const { currentTheme, isTransitioning } = useTheme();

  const isMyTurn = wsGameState?.currentPlayerId === currentUserId;
  const activePlayerName = wsGameState?.players[wsGameState?.currentPlayerId]?.name || 'A player';

  useEffect(() => {
    if (isConnected && isMyTurn) {
        toast({ title: "It's your turn!", description: "Work together to find the word." });
    }
  }, [isConnected, isMyTurn, toast]);

  const handleKeyPress = (key: string) => {
    if (!isMyTurn || wsGameState?.status !== 'playing' || isSubmitting) return;

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
    sendMessage({
      action: 'submit_coop_guess',
      guess: currentGuess,
      playerId: currentUserId,
    });

    // The actual state update will come from the WebSocket echo.
    // We optimistically clear the guess and disable the keyboard.
    setCurrentGuess("");
    // A slight delay to prevent spamming while waiting for WebSocket message
    setTimeout(() => setIsSubmitting(false), 1000);
  };

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
  
  const renderSharedBoard = () => {
      // In cooperative mode, there is one shared board state.
      // We can take the guesses from any player, but we'll use turnHistory for order.
      const allGuesses = wsGameState?.turnHistory || [];
      const displayGuesses = Array.from({ length: wsGameState?.maxGuesses ?? 6 });

      return (
        <div className="flex flex-col items-center gap-2">
            {displayGuesses.map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                    {Array.from({ length: wsGameState?.wordLength ?? wordLength }).map((_, colIndex) => {
                        const guessData = allGuesses[rowIndex];
                        // This logic will need to be refined based on how the backend structures the shared guess history
                        const letter = guessData ? guessData.guess[colIndex] : (isMyTurn && rowIndex === allGuesses.length ? currentGuess[colIndex] : '') || '';
                        // The result would also come from a shared history object
                        const result = undefined; // Placeholder
                        return renderTile(letter, result, colIndex);
                    })}
                </div>
            ))}
        </div>
      )
  };

  if (!isConnected || !wsGameState) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.background}`}>
        <Loader2 className="w-16 h-16 text-white animate-spin" />
        <p className="text-white text-2xl ml-4">Joining Cooperative Game...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4`}>
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={onBack} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leave
                </Button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Cooperative Mode</h1>
                    <p className="text-blue-100">{isMyTurn ? "It's your turn!" : `Waiting for ${activePlayerName}...`}</p>
                </div>
                 <div className="w-24" /> {/* Spacer */}
            </div>

            {/* Main Game Card */}
            <Card className="bg-white/95 border-0 shadow-xl mb-6">
                <CardHeader>
                    <CardTitle className="text-center text-gray-800">
                      Work together to find the word!
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {renderSharedBoard()}
                </CardContent>
            </Card>

            {/* Player List and Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.values(wsGameState.players).map((p: { name: string; score: number }) => (
                    <Card key={p.name} className={`bg-white/90 border-2 ${wsGameState.currentPlayerId === 'player1' ? 'border-blue-400' : 'border-transparent'}`}>
                       <CardContent className="p-4 text-center">
                           <div className="font-bold text-lg">{p.name} {p.name === 'You' ? '(You)' : ''}</div>
                           <div className="text-xl">{p.score} pts</div>
                       </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Keyboard */}
            <div className="max-w-2xl mx-auto">
                 <VirtualKeyboard 
                    onKeyPress={handleKeyPress} 
                    usedLetters={{}} // This would come from shared game state
                    disabled={!isMyTurn || isSubmitting || wsGameState.status !== 'playing'}
                 />
            </div>
        </div>
    </div>
  );
};

export default CooperativeGame;
