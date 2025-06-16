
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import GameStats from "./GameStats";
import ThemeSelector from "./ThemeSelector";
import { checkGuess, getRandomWord, isValidWord } from "@/lib/gameLogic";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface GameBoardProps {
  gameMode: string;
  wordLength: number;
  onBack: () => void;
}

type GuessResult = 'correct' | 'present' | 'absent' | '';

const GameBoard = ({ gameMode, wordLength, onBack }: GameBoardProps) => {
  const [targetWord, setTargetWord] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<Record<string, GuessResult>>({});
  const { toast } = useToast();
  const { currentTheme } = useTheme();

  const maxGuesses = 6;

  useEffect(() => {
    startNewGame();
  }, [wordLength]);

  const startNewGame = () => {
    const newWord = getRandomWord(wordLength);
    setTargetWord(newWord);
    setCurrentGuess('');
    setGuesses([]);
    setGuessResults([]);
    setGameStatus('playing');
    setUsedLetters({});
    console.log('New game started with word:', newWord); // For debugging
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

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
      toast({
        title: "Invalid guess",
        description: `Word must be ${wordLength} letters long`,
        variant: "destructive"
      });
      return;
    }

    if (!isValidWord(currentGuess)) {
      toast({
        title: "Invalid word",
        description: "Please enter a valid word",
        variant: "destructive"
      });
      return;
    }

    const result = checkGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, currentGuess];
    const newGuessResults = [...guessResults, result];

    // Update used letters
    const newUsedLetters = { ...usedLetters };
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      const letterResult = result[i];
      
      if (!newUsedLetters[letter] || 
          (newUsedLetters[letter] === 'absent' && letterResult !== 'absent') ||
          (newUsedLetters[letter] === 'present' && letterResult === 'correct')) {
        newUsedLetters[letter] = letterResult;
      }
    }

    setGuesses(newGuesses);
    setGuessResults(newGuessResults);
    setUsedLetters(newUsedLetters);
    setCurrentGuess('');

    // Check win condition
    if (currentGuess === targetWord) {
      setGameStatus('won');
      toast({
        title: "Congratulations!",
        description: `You won in ${newGuesses.length} guess${newGuesses.length === 1 ? '' : 'es'}!`,
      });
    } else if (newGuesses.length >= maxGuesses) {
      setGameStatus('lost');
      toast({
        title: "Game Over",
        description: `The word was: ${targetWord}`,
        variant: "destructive"
      });
    }
  };

  const renderTile = (letter: string, result: GuessResult, index: number, isCurrentGuess: boolean = false) => {
    let bgColor = currentTheme.colors.empty;
    let textColor = 'text-gray-800';

    if (!isCurrentGuess) {
      switch (result) {
        case 'correct':
          bgColor = currentTheme.colors.correct;
          textColor = 'text-white';
          break;
        case 'present':
          bgColor = currentTheme.colors.present;
          textColor = 'text-white';
          break;
        case 'absent':
          bgColor = currentTheme.colors.absent;
          textColor = 'text-white';
          break;
      }
    } else if (letter) {
      bgColor = currentTheme.colors.current;
      textColor = 'text-blue-800';
    }

    return (
      <div
        key={index}
        className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300 ${bgColor} ${textColor}`}
      >
        {letter}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <h1 className="text-3xl font-bold text-white">
            {gameMode === 'solo' ? 'Solo Play' : gameMode}
          </h1>
          <div className="flex gap-2">
            <ThemeSelector />
            <Button
              variant="outline"
              onClick={startNewGame}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
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
                <CardTitle className="text-center text-2xl text-gray-800">
                  {wordLength} Letter Word
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2 mb-8">
                  {/* Previous guesses */}
                  {guesses.map((guess, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                      {guess.split('').map((letter, colIndex) =>
                        renderTile(letter, guessResults[rowIndex][colIndex], colIndex)
                      )}
                    </div>
                  ))}

                  {/* Current guess row */}
                  {gameStatus === 'playing' && guesses.length < maxGuesses && (
                    <div className="flex gap-2">
                      {Array.from({ length: wordLength }).map((_, index) =>
                        renderTile(
                          currentGuess[index] || '', 
                          '', 
                          index, 
                          true
                        )
                      )}
                    </div>
                  )}

                  {/* Empty rows */}
                  {Array.from({ length: maxGuesses - guesses.length - (gameStatus === 'playing' ? 1 : 0) }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                      {Array.from({ length: wordLength }).map((_, colIndex) =>
                        renderTile('', '', colIndex)
                      )}
                    </div>
                  ))}
                </div>

                {/* Game Status */}
                {gameStatus !== 'playing' && (
                  <div className="text-center mb-6">
                    <div className={`text-2xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                      {gameStatus === 'won' ? '🎉 You Won!' : '😔 You Lost!'}
                    </div>
                    <div className="text-lg text-gray-600">
                      {gameStatus === 'won' 
                        ? `Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}!`
                        : `The word was: ${targetWord}`
                      }
                    </div>
                  </div>
                )}

                {/* Virtual Keyboard */}
                <VirtualKeyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <GameStats 
              guesses={guesses.length}
              maxGuesses={maxGuesses}
              gameStatus={gameStatus}
              wordLength={wordLength}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
