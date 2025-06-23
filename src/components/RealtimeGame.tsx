
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import VirtualKeyboard from "./VirtualKeyboard";
import { checkGuess, getRandomWord, isValidWord } from "@/lib/gameLogic";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface RealtimeGameProps {
  wordLength: number;
  onBack: () => void;
}

type GuessResult = 'correct' | 'present' | 'absent' | '';

interface PlayerState {
  currentGuess: string;
  guesses: string[];
  guessResults: GuessResult[][];
  gameStatus: 'playing' | 'won' | 'lost';
  usedLetters: Record<string, GuessResult>;
  score: number;
}

const RealtimeGame = ({ wordLength, onBack }: RealtimeGameProps) => {
  const [targetWord, setTargetWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [gameActive, setGameActive] = useState(true);
  const [showOpponentWord, setShowOpponentWord] = useState(false); // Debug slider
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  
  // Player state (right side - you)
  const [player, setPlayer] = useState<PlayerState>({
    currentGuess: '',
    guesses: [],
    guessResults: [],
    gameStatus: 'playing',
    usedLetters: {},
    score: 0
  });

  // Opponent state (left side)
  const [opponent, setOpponent] = useState<PlayerState>({
    currentGuess: '',
    guesses: [],
    guessResults: [],
    gameStatus: 'playing',
    usedLetters: {},
    score: 0
  });

  const { toast } = useToast();
  const { currentTheme, isTransitioning } = useTheme();

  const maxGuesses = 6;

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [wordLength]);

  // Timer countdown
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const startNewGame = () => {
    const newWord = getRandomWord(wordLength);
    setTargetWord(newWord);
    setTimeLeft(300);
    setGameActive(true);
    setWinner(null);
    
    const initialState: PlayerState = {
      currentGuess: '',
      guesses: [],
      guessResults: [],
      gameStatus: 'playing',
      usedLetters: {},
      score: 0
    };
    
    setPlayer(initialState);
    setOpponent(initialState);
    console.log('New realtime game started with word:', newWord);
  };

  const endGame = () => {
    setGameActive(false);
    
    // Determine winner based on score or completion
    if (player.gameStatus === 'won' && opponent.gameStatus !== 'won') {
      setWinner('player');
    } else if (opponent.gameStatus === 'won' && player.gameStatus !== 'won') {
      setWinner('opponent');
    } else if (player.score > opponent.score) {
      setWinner('player');
    } else if (opponent.score > player.score) {
      setWinner('opponent');
    }
    // else it's a tie (winner stays null)
  };

  const calculateScore = (guessCount: number, timeUsed: number) => {
    // Score based on fewer guesses and faster completion
    const baseScore = Math.max(0, 7 - guessCount) * 100;
    const timeBonus = Math.max(0, 300 - timeUsed);
    return baseScore + timeBonus;
  };

  const handlePlayerKeyPress = (key: string) => {
    if (!gameActive || player.gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitPlayerGuess();
    } else if (key === 'BACKSPACE') {
      setPlayer(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      }));
    } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
      if (player.currentGuess.length < wordLength) {
        setPlayer(prev => ({
          ...prev,
          currentGuess: prev.currentGuess + key.toUpperCase()
        }));
      }
    }

    // TODO: Emit player state to backend for real-time sync
    // emitPlayerState({ currentGuess: player.currentGuess, action: key });
  };

  const submitPlayerGuess = () => {
    if (player.currentGuess.length !== wordLength) {
      toast({
        title: "Invalid guess",
        description: `Word must be ${wordLength} letters long`,
        variant: "destructive"
      });
      return;
    }

    if (!isValidWord(player.currentGuess)) {
      toast({
        title: "Invalid word",
        description: "Please enter a valid word",
        variant: "destructive"
      });
      return;
    }

    const result = checkGuess(player.currentGuess, targetWord);
    const newGuesses = [...player.guesses, player.currentGuess];
    const newGuessResults = [...player.guessResults, result];

    // Update used letters
    const newUsedLetters = { ...player.usedLetters };
    for (let i = 0; i < player.currentGuess.length; i++) {
      const letter = player.currentGuess[i];
      const letterResult = result[i];
      
      if (!newUsedLetters[letter] || 
          (newUsedLetters[letter] === 'absent' && letterResult !== 'absent') ||
          (newUsedLetters[letter] === 'present' && letterResult === 'correct')) {
        newUsedLetters[letter] = letterResult;
      }
    }

    let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
    let newScore = player.score;

    // Check win condition
    if (player.currentGuess === targetWord) {
      newGameStatus = 'won';
      newScore = calculateScore(newGuesses.length, 300 - timeLeft);
      setWinner('player');
      setGameActive(false);
      toast({
        title: "You won!",
        description: `Solved in ${newGuesses.length} guesses!`,
      });
    } else if (newGuesses.length >= maxGuesses) {
      newGameStatus = 'lost';
    }

    setPlayer(prev => ({
      ...prev,
      guesses: newGuesses,
      guessResults: newGuessResults,
      usedLetters: newUsedLetters,
      currentGuess: '',
      gameStatus: newGameStatus,
      score: newScore
    }));

    // TODO: Emit guess to backend
    // emitGuess({ guess: player.currentGuess, result, gameStatus: newGameStatus });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const renderPlayerBoard = (playerState: PlayerState, isPlayer: boolean) => (
    <div className="flex flex-col items-center gap-2">
      {/* Previous guesses */}
      {playerState.guesses.map((guess, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {guess.split('').map((letter, colIndex) =>
            renderTile(letter, playerState.guessResults[rowIndex][colIndex], colIndex)
          )}
        </div>
      ))}

      {/* Current guess row */}
      {playerState.gameStatus === 'playing' && playerState.guesses.length < maxGuesses && (
        <div className="flex gap-1">
          {Array.from({ length: wordLength }).map((_, index) =>
            renderTile(
              isPlayer ? playerState.currentGuess[index] || '' : '', 
              '', 
              index, 
              true
            )
          )}
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
            <h1 className="text-3xl font-bold text-white mb-2">1v1 Real-Time Battle</h1>
            {winner && (
              <div className={`text-2xl font-bold ${winner === 'player' ? 'text-green-300' : 'text-red-300'}`}>
                {winner === 'player' ? '🎉 You Won!' : '😔 Opponent Won!'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Debug toggle */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-2">
              <Label htmlFor="show-word" className="text-white text-sm">Debug View</Label>
              <Switch
                id="show-word"
                checked={showOpponentWord}
                onCheckedChange={setShowOpponentWord}
              />
              {showOpponentWord ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
            </div>
            <Button
              variant="outline"
              onClick={startNewGame}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              New Game
            </Button>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Opponent Board (Left) */}
          <Card className="bg-white/95 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Opponent
                <div className="text-sm font-normal">Score: {opponent.score}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {renderPlayerBoard(opponent, false)}
              {showOpponentWord && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Debug: Target Word</div>
                  <div className="font-bold text-lg">{targetWord}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timer (Center) */}
          <div className="flex flex-col items-center justify-center">
            <Card className="bg-white/95 border-0 shadow-xl w-full">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-gray-600">
                  {gameActive ? 'Time Remaining' : 'Game Over'}
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 300) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Board (Right - You) */}
          <Card className="bg-white/95 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                You
                <div className="text-sm font-normal">Score: {player.score}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {renderPlayerBoard(player, true)}
            </CardContent>
          </Card>
        </div>

        {/* Virtual Keyboard (Only for player) */}
        <div className="max-w-2xl mx-auto">
          <VirtualKeyboard 
            onKeyPress={handlePlayerKeyPress} 
            usedLetters={player.usedLetters}
            disabled={!gameActive || player.gameStatus !== 'playing'}
          />
        </div>

        {/* Integration Notes for Backend */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>
            Backend Integration Points: 
            Socket events for real-time sync, opponent state updates, game matching
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeGame;
