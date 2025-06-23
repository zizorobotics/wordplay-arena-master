import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Target, Zap, Trophy } from "lucide-react";
import GameBoard from "@/components/GameBoard";
import RealtimeGame from "@/components/RealtimeGame";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState(5);
  const { currentTheme, isTransitioning } = useTheme();

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
      description: 'Strategic play seeing each other\'s guesses',
      icon: Clock,
      color: 'bg-yellow-500',
      available: false
    },
    {
      id: 'cooperative',
      title: 'Cooperative',
      description: 'Work together to solve the puzzle',
      icon: Users,
      color: 'bg-green-500',
      available: false
    }
  ];

  const wordLengths = [4, 5, 6];

  if (gameMode === 'realtime') {
    return <RealtimeGame wordLength={wordLength} onBack={() => setGameMode(null)} />;
  }

  if (gameMode) {
    return <GameBoard gameMode={gameMode} wordLength={wordLength} onBack={() => setGameMode(null)} />;
  }

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
            return (
              <Card 
                key={mode.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer border-0 ${
                  mode.available 
                    ? "bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl" 
                    : "bg-gray-300/50 cursor-not-allowed"
                }`}
                onClick={() => mode.available && setGameMode(mode.id)}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 border-0">
            <CardContent className="text-center p-6">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">156</h3>
              <p className="text-gray-600">Games Won</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 border-0">
            <CardContent className="text-center p-6">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">4.2</h3>
              <p className="text-gray-600">Avg Guesses</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 border-0">
            <CardContent className="text-center p-6">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">12</h3>
              <p className="text-gray-600">Win Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-100 mt-12">
          <p>Ready to challenge your word skills? Choose your game mode and let's play!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
