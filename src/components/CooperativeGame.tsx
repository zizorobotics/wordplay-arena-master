
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { getRandomWord, checkGuess, isValidWord } from "@/lib/gameLogic";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { toast } from "sonner";

interface CooperativeGameProps {
  wordLength: number;
  onBack: () => void;
}

const CooperativeGame = ({ wordLength, onBack }: CooperativeGameProps) => {
  const [targetWord] = useState(() => getRandomWord(wordLength));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Record<string, 'correct' | 'present' | 'absent' | ''>>({});
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [canGuess, setCanGuess] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [recentGuesses, setRecentGuesses] = useState<{player: number, word: string}[]>([]);

  const maxGuesses = 6;

  useEffect(() => {
    console.log('New cooperative game started with word:', targetWord);
  }, [targetWord]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canGuess) {
      setCanGuess(true);
    }
  }, [countdown, canGuess]);

  const handleKeyPress = (key: string) => {
    if (!canGuess || gameWon || gameLost) return;

    if (key === 'ENTER') {
      if (currentGuess.length === wordLength) {
        if (isValidWord(currentGuess)) {
          makeGuess();
        } else {
          toast.error('Not a valid word!');
        }
      } else {
        toast.error(`Word must be ${wordLength} letters long!`);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < wordLength && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const makeGuess = () => {
    const guessResult = checkGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    // Add to recent guesses
    const newRecentGuess = { player: currentPlayer, word: currentGuess };
    setRecentGuesses(prev => [newRecentGuess, ...prev.slice(0, 4)]);

    // Update used letters
    const newUsedLetters = { ...usedLetters };
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      const status = guessResult[i];
      if (!newUsedLetters[letter] || 
          (newUsedLetters[letter] === 'absent' && status !== 'absent') ||
          (newUsedLetters[letter] === 'present' && status === 'correct')) {
        newUsedLetters[letter] = status;
      }
    }
    setUsedLetters(newUsedLetters);

    // Check win condition
    if (currentGuess === targetWord) {
      setGameWon(true);
      toast.success(`🎉 Victory! Player ${currentPlayer} solved it with "${currentGuess}"!`);
    } else if (newGuesses.length >= maxGuesses) {
      setGameLost(true);
      toast.error(`Game Over! The word was "${targetWord}"`);
    } else {
      // Switch players and start delay
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setCanGuess(false);
      setCountdown(3);
      toast.info(`Player ${currentPlayer} guessed "${currentGuess}". Player ${currentPlayer === 1 ? 2 : 1}'s turn in 3 seconds!`);
    }

    setCurrentGuess('');
  };

  const renderGuessGrid = () => {
    const rows = [];
    
    // Render completed guesses
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      const guessResult = checkGuess(guess, targetWord);
      
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {guess.split('').map((letter, j) => (
            <div
              key={j}
              className={`w-12 h-12 flex items-center justify-center text-white font-bold text-lg border-2 ${
                guessResult[j] === 'correct'
                  ? 'bg-green-500 border-green-500'
                  : guessResult[j] === 'present'
                  ? 'bg-yellow-500 border-yellow-500'
                  : 'bg-gray-500 border-gray-500'
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
      );
    }

    // Render current guess row
    if (!gameWon && !gameLost && guesses.length < maxGuesses) {
      rows.push(
        <div key="current" className="flex gap-2 justify-center mb-2">
          {Array.from({ length: wordLength }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 flex items-center justify-center text-gray-800 font-bold text-lg border-2 border-gray-400 bg-white"
            >
              {currentGuess[i] || ''}
            </div>
          ))}
        </div>
      );
    }

    // Render empty rows
    const remainingRows = maxGuesses - guesses.length - (gameWon || gameLost ? 0 : 1);
    for (let i = 0; i < remainingRows; i++) {
      rows.push(
        <div key={`empty-${i}`} className="flex gap-2 justify-center mb-2">
          {Array.from({ length: wordLength }).map((_, j) => (
            <div
              key={j}
              className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 bg-gray-100"
            />
          ))}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              <Users className="w-8 h-8 inline mr-2" />
              Cooperative Mode
            </h1>
            <p className="text-blue-100">Work together to solve the word!</p>
          </div>
          
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Main Game Card */}
        <Card className="bg-white/95 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              Guess {guesses.length + 1} of {maxGuesses}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Player Status */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-lg ${currentPlayer === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <div className="text-lg font-bold">Player 1</div>
                {currentPlayer === 1 && !gameWon && !gameLost && (
                  <div className="text-sm">Your Turn</div>
                )}
              </div>

              {countdown > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold">{countdown}</span>
                </div>
              )}

              <div className={`px-4 py-2 rounded-lg ${currentPlayer === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <div className="text-lg font-bold">Player 2</div>
                {currentPlayer === 2 && !gameWon && !gameLost && (
                  <div className="text-sm">Your Turn</div>
                )}
              </div>
            </div>

            {/* Game Grid */}
            <div className="mb-6">
              {renderGuessGrid()}
            </div>

            {/* Game Over Messages */}
            {gameWon && (
              <div className="text-center p-4 bg-green-100 rounded-lg mb-4">
                <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Congratulations!</h2>
                <p className="text-green-700">You both solved it together!</p>
                <p className="text-green-600 mt-2">The word was: <span className="font-bold">{targetWord}</span></p>
              </div>
            )}

            {gameLost && (
              <div className="text-center p-4 bg-red-100 rounded-lg mb-4">
                <h2 className="text-2xl font-bold text-red-800 mb-2">Game Over</h2>
                <p className="text-red-700">Better luck next time!</p>
                <p className="text-red-600 mt-2">The word was: <span className="font-bold">{targetWord}</span></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Guesses */}
        {recentGuesses.length > 0 && (
          <Card className="bg-white/95 mb-6">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Recent Guesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentGuesses.map((guess, index) => (
                  <div key={index} className="text-center text-gray-700">
                    <span className="font-semibold">Player {guess.player}</span> guessed "{guess.word}"
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Mode - Two Keyboards */}
        <div className="space-y-6">
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Player 1 Keyboard</CardTitle>
            </CardHeader>
            <CardContent>
              <VirtualKeyboard
                onKeyPress={currentPlayer === 1 ? handleKeyPress : () => {}}
                usedLetters={usedLetters}
                disabled={currentPlayer !== 1 || !canGuess || gameWon || gameLost}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Player 2 Keyboard</CardTitle>
            </CardHeader>
            <CardContent>
              <VirtualKeyboard
                onKeyPress={currentPlayer === 2 ? handleKeyPress : () => {}}
                usedLetters={usedLetters}
                disabled={currentPlayer !== 2 || !canGuess || gameWon || gameLost}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CooperativeGame;
