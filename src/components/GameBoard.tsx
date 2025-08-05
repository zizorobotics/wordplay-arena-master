import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import GameStats from "./GameStats";
import ThemeSelector from "./ThemeSelector";
import { checkGuess, startNewGame, isValidWord } from "@/lib/gameLogic";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface GameBoardProps {
  gameMode: string;
  wordLength: number;
  onBack: () => void;
}

type GuessResult = 'correct' | 'present' | 'absent' | '';

const GameBoard = ({ gameMode, wordLength, onBack }: GameBoardProps) => {
  // A unique ID for the game session, generated client-side.
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<Record<string, GuessResult>>({});
  
  const { toast } = useToast();
  const { currentTheme, isTransitioning } = useTheme();

  const maxGuesses = 6;

  // Function to initialize or restart the game
  const handleStartNewGame = useCallback(async () => {
    setIsLoading(true);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    try {
      const response = await startNewGame(wordLength, newSessionId);
      if (response.success) {
        setCurrentGuess('');
        setGuesses([]);
        setGuessResults([]);
        setGameStatus('playing');
        setUsedLetters({});
      } else {
        toast({
          title: "Error",
          description: `Could not start a new game: ${response.message}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to communicate with the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [wordLength, toast]);

  useEffect(() => {
    handleStartNewGame();
  }, [wordLength, handleStartNewGame]); // Include the function in dependencies

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing' || isChecking) return;

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

  const submitGuess = async () => {
    if (currentGuess.length !== wordLength) {
      toast({ title: "Invalid guess", description: `Word must be ${wordLength} letters long`, variant: "destructive" });
      return;
    }

    setIsChecking(true);
    const wordIsValid = await isValidWord(currentGuess);
    if (!wordIsValid) {
      toast({ title: "Invalid word", description: "Please enter a valid word", variant: "destructive" });
      setIsChecking(false);
      return;
    }

    try {
      const result = await checkGuess(currentGuess, sessionId);
      
      // Use functional updates to ensure atomic state changes
      setGuesses(prevGuesses => {
        const newGuesses = [...prevGuesses, currentGuess];

      // Update used letters based on the result from the backend
        setUsedLetters(prevUsedLetters => {
          const newUsedLetters = { ...prevUsedLetters };
      for (let i = 0; i < currentGuess.length; i++) {
        const letter = currentGuess[i];
        const letterResult = result[i];
        if (!newUsedLetters[letter] || (newUsedLetters[letter] === 'absent' && letterResult !== 'absent') || (newUsedLetters[letter] === 'present' && letterResult === 'correct')) {
          newUsedLetters[letter] = letterResult;
        }
      }
          return newUsedLetters;
        });

        setGuessResults(prevResults => [...prevResults, result]);

      // Check win condition
      if (result.every(r => r === 'correct')) {
        setGameStatus('won');
        toast({ title: "Congratulations!", description: `You won in ${newGuesses.length} guess${newGuesses.length === 1 ? '' : 'es'}!` });
      } else if (newGuesses.length >= maxGuesses) {
        setGameStatus('lost');
        // The backend could optionally send the correct word upon game over
        toast({ title: "Game Over", description: "Better luck next time!", variant: "destructive" });
      }
        
        return newGuesses;
      });
    } catch (error) {
      toast({ title: "Submission Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setCurrentGuess('');
      setIsChecking(false);
    }
  };

  const renderTile = (letter: string, result: GuessResult, index: number, isCurrentGuess: boolean = false) => {
    let bgColor = currentTheme.colors.empty;
    let textColor = 'text-gray-800';

    if (!isCurrentGuess) {
      switch (result) {
        case 'correct': bgColor = currentTheme.colors.correct; textColor = 'text-white'; break;
        case 'present': bgColor = currentTheme.colors.present; textColor = 'text-white'; break;
        case 'absent': bgColor = currentTheme.colors.absent; textColor = 'text-white'; break;
      }
    } else if (letter) {
      bgColor = currentTheme.colors.current;
      textColor = 'text-blue-800';
    }

    return (
      <div key={index} className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300 ${bgColor} ${textColor}`}>
        {letter}
      </div>
    );
  };
  
  if (isLoading) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${currentTheme.background}`}>
            <Loader2 className="w-16 h-16 text-white animate-spin" />
            <p className="text-white text-2xl ml-4">Starting New Game...</p>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={onBack} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{gameMode === 'solo' ? 'Solo Play' : gameMode}</h1>
          <div className="flex gap-2">
            <ThemeSelector />
            <Button variant="outline" onClick={handleStartNewGame} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-gray-800">{wordLength} Letter Word</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2 mb-8">
                  {/* Render board */}
                  {Array.from({ length: maxGuesses }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                      {Array.from({ length: wordLength }).map((_, colIndex) => {
                        const guess = guesses[rowIndex];
                        const result = guessResults[rowIndex]?.[colIndex];
                        const letter = guess ? guess[colIndex] : (rowIndex === guesses.length && currentGuess[colIndex]) || '';
                        const isCurrentRow = rowIndex === guesses.length;
                        return renderTile(letter, result || '', colIndex, isCurrentRow && !!letter);
                      })}
                    </div>
                  ))}
                </div>
                
                {gameStatus !== 'playing' && (
                  <div className="text-center mb-6">
                    <div className={`text-2xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                      {gameStatus === 'won' ? '🎉 You Won!' : '😔 You Lost!'}
                    </div>
                  </div>
                )}
                
                <VirtualKeyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} disabled={gameStatus !== 'playing' || isChecking} />
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <GameStats guesses={guesses.length} maxGuesses={maxGuesses} gameStatus={gameStatus} wordLength={wordLength}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;