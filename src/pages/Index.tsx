import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Users, Clock, Target, Zap, Trophy, Star, Gem, Settings } from "lucide-react";
import GameBoard from "@/components/GameBoard";
import RealtimeGame from "@/components/RealtimeGame";
import TurnBasedGame from "@/components/TurnBasedGame";
import CooperativeGame from "@/components/CooperativeGame";
import MatchmakingPage from "@/components/MatchmakingPage";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState(5);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const { currentTheme, isTransitioning } = useTheme();

  // Stats data (without word rank)
  const statsData = [
    {
      icon: Trophy,
      value: "0",
      label: "Games Won",
      color: "text-yellow-500"
    },
    {
      icon: Target,
      value: "2,450",
      label: "Total Points",
      color: "text-blue-500"
    },
    {
      icon: Gem,
      value: "10",
      label: "Gems",
      color: "text-purple-500"
    },
    {
      icon: Star,
      value: null, // Special case for level slider
      label: "Level 1",
      color: "text-indigo-500",
      level: 1,
      progress: 25 // 25% progress to next level
    }
  ];

  // Rotate stats every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prevIndex) => (prevIndex + 1) % statsData.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const gameModes = [
    {
      id: 'solo',
      title: 'Solo Play',
      description: 'Classic Wordle experience with daily challenges',
      icon: Target,
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'realtime',
      title: '1v1 Real-Time',
      description: 'Race against another player to solve first',
      icon: Zap,
      color: 'bg-red-500',
      available: true
    },
    {
      id: 'turnbased',
      title: '1v1 Turn-Based',
      description: 'You and another player take turns guessing the same word. You can see each other\'s guesses, adding a strategic element.',
      icon: Clock,
      color: 'bg-yellow-500',
      available: true
    },
    {
      id: 'cooperative',
      title: 'Cooperative',
      description: 'Work together with another player to solve one puzzle, taking turns',
      icon: Users,
      color: 'bg-green-500',
      available: true
    }
  ];

  const wordLengths = [4, 5, 6];

  const handleMultiplayerMode = (mode: string) => {
    setGameMode(mode);
    setShowMatchmaking(true);
  };

  const handlePlayerFound = () => {
    setShowMatchmaking(false);
  };

  const handleBackFromMatchmaking = () => {
    setGameMode(null);
    setShowMatchmaking(false);
  };

  const handleBackFromGame = () => {
    setGameMode(null);
  };

  // Show matchmaking for all multiplayer modes
  if (showMatchmaking && (gameMode === 'realtime' || gameMode === 'turnbased' || gameMode === 'cooperative')) {
    return (
      <MatchmakingPage 
        wordLength={wordLength} 
        onBack={handleBackFromMatchmaking}
        onPlayerFound={handlePlayerFound}
      />
    );
  }

  // Show the actual games after matchmaking
  if (gameMode === 'realtime') {
    return <RealtimeGame wordLength={wordLength} onBack={handleBackFromGame} />;
  }

  if (gameMode === 'turnbased') {
    return <TurnBasedGame wordLength={wordLength} onBack={handleBackFromGame} />;
  }

  if (gameMode === 'cooperative') {
    return <CooperativeGame wordLength={wordLength} onBack={handleBackFromGame} />;
  }

  // Solo mode doesn't need matchmaking
  if (gameMode) {
    return <GameBoard gameMode={gameMode} wordLength={wordLength} onBack={handleBackFromGame} />;
  }

  const currentStat = statsData[currentStatIndex];
  const IconComponent = currentStat.icon;

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Word<span className="text-yellow-300">Master</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            The ultimate multiplayer Wordle experience. Challenge friends, compete globally, and master the art of word puzzles.
          </p>
        </div>

        {/* Word Length Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">Choose Word Length</h2>
          <div className="flex justify-center gap-4">
            {wordLengths.map((length) => (
              <Button
                key={length}
                variant={wordLength === length ? "default" : "outline"}
                onClick={() => setWordLength(length)}
                className={`px-6 py-3 text-lg font-semibold transition-all duration-200 ${
                  wordLength === length 
                    ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                {length} Letters
              </Button>
            ))}
          </div>
        </div>

        {/* Game Modes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {gameModes.map((mode) => {
            const IconComponent = mode.icon;
            const handleClick = () => {
              if (!mode.available) return;
              
              if (mode.id === 'solo') {
                setGameMode(mode.id);
              } else {
                // All multiplayer modes use matchmaking
                handleMultiplayerMode(mode.id);
              }
            };
            
            return (
              <Card 
                key={mode.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer border-0 ${
                  mode.available 
                    ? "bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl" 
                    : "bg-gray-300/50 cursor-not-allowed"
                }`}
                onClick={handleClick}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${mode.color} text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${mode.available ? "text-gray-800" : "text-gray-500"}`}>
                          {mode.title}
                        </CardTitle>
                      </div>
                    </div>
                    {!mode.available && (
                      <Badge variant="secondary" className="bg-gray-400 text-white">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-base ${mode.available ? "text-gray-600" : "text-gray-400"}`}>
                    {mode.description}
                  </CardDescription>
                </CardContent>
                {mode.available && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom Section - Three Divs */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Left: Rotating Stats Display */}
          <div className="flex justify-center">
            <Card className="bg-white/90 border-0 w-full">
              <CardContent className="text-center p-6 overflow-hidden">
                <div
                  key={currentStatIndex}
                  className="animate-slide-in-up transition-all duration-500 ease-out"
                >
                  <IconComponent className={`w-12 h-12 ${currentStat.color} mx-auto mb-4`} />
                  
                  {currentStat.value ? (
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentStat.value}</h3>
                  ) : (
                    // Special level display with slider
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentStat.label}</h3>
                      <div className="px-4">
                        <Slider
                          value={[currentStat.progress || 0]}
                          max={100}
                          step={1}
                          className="w-full"
                          disabled
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Level {currentStat.level}</span>
                          <span>Level {(currentStat.level || 1) + 1}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentStat.value && (
                    <p className="text-gray-600 text-lg">{currentStat.label}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: Settings */}
          <div className="flex justify-center">
            <Card className="bg-white/90 border-0 w-full cursor-pointer hover:bg-white/95 transition-all duration-200">
              <CardContent className="text-center p-6">
                <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Settings</h3>
                <p className="text-gray-600 text-lg">Customize Game</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Leaderboard & Word Rank */}
          <div className="flex justify-center">
            <Card className="bg-white/90 border-0 w-full cursor-pointer hover:bg-white/95 transition-all duration-200">
              <CardContent className="text-center p-6">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">500</h3>
                <p className="text-gray-600 text-lg">Word Rank</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-100 mt-12">
          <p>Ready to challenge your word skills? Choose your game mode and let's play!</p>
        </div>
      </div>

      <style>
        {`
          @keyframes slide-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slide-in-up {
            animation: slide-in-up 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Index;
