
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Users, Zap } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import { checkGuess, getRandomWord, isValidWord } from "@/lib/gameLogic";
import { calculateGuessScore, formatScoreBreakdown, getPerformanceRating, type GuessScore, type PlayerScoring } from "@/lib/scoringSystem";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface TurnBasedGameProps {
  wordLength: number;
  onBack: () => void;
}

type GuessResult = 'correct' | 'present' | 'absent' | '';

interface PlayerState {
  name: string;
  guesses: string[];
  guessResults: GuessResult[][];
  gameStatus: 'playing' | 'won' | 'lost';
  usedLetters: Record<string, GuessResult>;
  scoring: PlayerScoring;
}

interface GameGuess {
  player: string;
  guess: string;
  result: GuessResult[];
  score: GuessScore;
}

const TurnBasedGame = ({ wordLength, onBack }: TurnBasedGameProps) => {
  const [targetWord, setTargetWord] = useState('');
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameHistory, setGameHistory] = useState<GameGuess[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [winner, setWinner] = useState<'player1' | 'player2' | 'tie' | null>(null);
  const [canGuess, setCanGuess] = useState(true);
  const [countdownTimer, setCountdownTimer] = useState(0);
  
  const [player1, setPlayer1] = useState<PlayerState>({
    name: 'Player 1',
    guesses: [],
    guessResults: [],
    gameStatus: 'playing',
    usedLetters: {},
    scoring: {
      currentScore: 0,
      lastGuessScore: null,
      guessStartTime: Date.now()
    }
  });

  const [player2, setPlayer2] = useState<PlayerState>({
    name: 'Player 2',
    guesses: [],
    guessResults: [],
    gameStatus: 'playing',
    usedLetters: {},
    scoring: {
      currentScore: 0,
      lastGuessScore: null,
      guessStartTime: Date.now()
    }
  });

  const { toast } = useToast();
  const { currentTheme, isTransitioning } = useTheme();

  const maxGuesses = 6;

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [wordLength]);

  // Countdown timer for guess delay
  useEffect(() => {
    if (countdownTimer > 0) {
      const timer = setTimeout(() => {
        setCountdownTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownTimer === 0 && !canGuess) {
      setCanGuess(true);
    }
  }, [countdownTimer, canGuess]);

  const startNewGame = () => {
    const newWord = getRandomWord(wordLength);
    setTargetWord(newWord);
    setCurrentTurn('player1');
    setCurrentGuess('');
    setGameHistory([]);
    setGameActive(true);
    setWinner(null);
    setCanGuess(true);
    setCountdownTimer(0);
    
    const initialState: PlayerState = {
      name: 'Player 1',
      guesses: [],
      guessResults: [],
      gameStatus: 'playing',
      usedLetters: {},
      scoring: {
        currentScore: 0,
        lastGuessScore: null,
        guessStartTime: Date.now()
      }
    };
    
    setPlayer1(initialState);
    setPlayer2({ ...initialState, name: 'Player 2' });
    console.log('New turn-based game started with word:', newWord);
  };

  const getCurrentPlayer = () => currentTurn === 'player1' ? player1 : player2;
  const setCurrentPlayer = (updater: (prev: PlayerState) => PlayerState) => {
    if (currentTurn === 'player1') {
      setPlayer1(updater);
    } else {
      setPlayer2(updater);
    }
  };

  const handleKeyPress = (key: string) => {
    if (!gameActive || !canGuess || getCurrentPlayer().gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
      if (currentGuess.length === 0) {
        // Reset guess start time on first letter
        setCurrentPlayer(prev => ({
          ...prev,
          scoring: {
            ...prev.scoring,
            guessStartTime: Date.now()
          }
        }));
      }
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

    const currentPlayer = getCurrentPlayer();
    const result = checkGuess(currentGuess, targetWord);
    const timeTaken = (Date.now() - currentPlayer.scoring.guessStartTime) / 1000;
    const guessScore = calculateGuessScore(result, timeTaken);
    
    const newGuesses = [...currentPlayer.guesses, currentGuess];
    const newGuessResults = [...currentPlayer.guessResults, result];

    // Update used letters
    const newUsedLetters = { ...currentPlayer.usedLetters };
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      const letterResult = result[i];
      
      if (!newUsedLetters[letter] || 
          (newUsedLetters[letter] === 'absent' && letterResult !== 'absent') ||
          (newUsedLetters[letter] === 'present' && letterResult === 'correct')) {
        newUsedLetters[letter] = letterResult;
      }
    }

    let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
    const newScore = currentPlayer.scoring.currentScore + guessScore.totalScore;

    // Add to game history
    const gameGuess: GameGuess = {
      player: currentPlayer.name,
      guess: currentGuess,
      result,
      score: guessScore
    };
    setGameHistory(prev => [...prev, gameGuess]);

    // Check win condition
    if (currentGuess === targetWord) {
      newGameStatus = 'won';
      setWinner(currentTurn);
      setGameActive(false);
      
      const performance = getPerformanceRating(guessScore);
      toast({
        title: `${performance.emoji} ${currentPlayer.name} won!`,
        description: `Solved in ${newGuesses.length} guesses! ${performance.rating} performance!`,
      });
    } else if (newGuesses.length >= maxGuesses) {
      newGameStatus = 'lost';
      // Check if both players have used all guesses
      const otherPlayer = currentTurn === 'player1' ? player2 : player1;
      if (otherPlayer.guesses.length >= maxGuesses) {
        setGameActive(false);
        // Determine winner by score
        const otherScore = otherPlayer.scoring.currentScore;
        if (newScore > otherScore) {
          setWinner(currentTurn);
        } else if (otherScore > newScore) {
          setWinner(currentTurn === 'player1' ? 'player2' : 'player1');
        } else {
          setWinner('tie');
        }
      }
    }

    // Show score breakdown toast
    if (guessScore.totalScore > 0) {
      const breakdown = formatScoreBreakdown(guessScore);
      const performance = getPerformanceRating(guessScore);
      toast({
        title: `${currentPlayer.name}: +${guessScore.totalScore} points! ${performance.emoji}`,
        description: breakdown,
      });
    }

    // Update current player state
    setCurrentPlayer(prev => ({
      ...prev,
      guesses: newGuesses,
      guessResults: newGuessResults,
      usedLetters: newUsedLetters,
      gameStatus: newGameStatus,
      scoring: {
        currentScore: newScore,
        lastGuessScore: guessScore,
        guessStartTime: Date.now()
      }
    }));

    // Switch turns and apply 3-second delay
    if (gameActive && newGameStatus === 'playing') {
      setCurrentTurn(prev => prev === 'player1' ? 'player2' : 'player1');
      setCanGuess(false);
      setCountdownTimer(3);
    }

    setCurrentGuess('');
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
        className={`w-12 h-12 border-2 flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-300 ${bgColor} ${textColor}`}
      >
        {letter}
      </div>
    );
  };

  const renderPlayerBoard = (playerState: PlayerState) => (
    <div className="flex flex-col items-center gap-2">
      {/* Previous guesses */}
      {playerState.guesses.map((guess, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {guess.split('').map((letter, colIndex) =>
            renderTile(letter, playerState.guessResults[rowIndex][colIndex], colIndex)
          )}
        </div>
      ))}

      {/* Current guess row (only for current player) */}
      {playerState.gameStatus === 'playing' && playerState.guesses.length < maxGuesses && (
        <div className="flex gap-1">
          {Array.from({ length: wordLength }).map((_, index) => {
            const letter = currentTurn === (playerState.name === 'Player 1' ? 'player1' : 'player2') 
              ? currentGuess[index] || '' 
              : '';
            return renderTile(letter, '', index, true);
          })}
        </div>
      )}

      {/* Empty rows */}
      {Array.from({ length: maxGuesses - playerState.guesses.length - (playerState.gameStatus === 'playing' ? 1 : 0) }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {Array.from({ length: wordLength }).map((_, colIndex) =>
            renderTile('', '', colIndex)
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">1v1 Turn-Based Battle</h1>
            {winner && (
              <div className={`text-2xl font-bold ${
                winner === 'player1' ? 'text-green-300' : 
                winner === 'player2' ? 'text-blue-300' : 'text-yellow-300'
              }`}>
                {winner === 'tie' ? '🤝 It\'s a Tie!' : `🎉 ${winner === 'player1' ? 'Player 1' : 'Player 2'} Won!`}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={startNewGame}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            New Game
          </Button>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Player 1 Board */}
          <Card className="bg-white/95 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className={`text-center text-xl flex items-center justify-center gap-2 ${
                currentTurn === 'player1' ? 'text-green-600' : 'text-gray-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  currentTurn === 'player1' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                Player 1
                {currentTurn === 'player1' && <span className="text-sm">(Your Turn)</span>}
              </CardTitle>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5" />
                  {player1.scoring.currentScore}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {renderPlayerBoard(player1)}
            </CardContent>
          </Card>

          {/* Turn Indicator & Game History */}
          <div className="flex flex-col gap-4">
            <Card className="bg-white/95 border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {!canGuess ? `Wait ${countdownTimer}s` : `${currentTurn === 'player1' ? 'Player 1' : 'Player 2'}'s Turn`}
                </div>
                <div className="text-lg text-gray-600">
                  {gameActive ? 'Strategic Turn-Based' : 'Game Over'}
                </div>
              </CardContent>
            </Card>

            {/* Game History */}
            <Card className="bg-white/95 border-0 shadow-xl flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-800 text-center">Recent Guesses</CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-64 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">No guesses yet</p>
                ) : (
                  <div className="space-y-2">
                    {gameHistory.slice(-5).reverse().map((guess, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-semibold text-gray-800">
                          {guess.player} guessed "{guess.guess}"
                        </div>
                        <div className="text-gray-600">
                          +{guess.score.totalScore} points
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player 2 Board */}
          <Card className="bg-white/95 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className={`text-center text-xl flex items-center justify-center gap-2 ${
                currentTurn === 'player2' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  currentTurn === 'player2' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                Player 2
                {currentTurn === 'player2' && <span className="text-sm">(Your Turn)</span>}
              </CardTitle>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5" />
                  {player2.scoring.currentScore}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {renderPlayerBoard(player2)}
            </CardContent>
          </Card>
        </div>

        {/* Virtual Keyboard */}
        <div className="max-w-2xl mx-auto">
          <VirtualKeyboard 
            onKeyPress={handleKeyPress} 
            usedLetters={getCurrentPlayer().usedLetters}
            disabled={!gameActive || !canGuess || getCurrentPlayer().gameStatus !== 'playing'}
          />
        </div>

        {/* Game Description */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>
            You and another player take turns guessing the same word. You can see each other's guesses, adding a strategic element.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TurnBasedGame;
