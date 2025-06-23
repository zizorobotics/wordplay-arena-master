
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, TrendingUp, Star } from "lucide-react";

interface GameStatsProps {
  guesses: number;
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  wordLength: number;
}

const GameStats = ({ guesses, maxGuesses, gameStatus, wordLength }: GameStatsProps) => {
  const progressPercentage = (guesses / maxGuesses) * 100;

  return (
    <div className="space-y-4">
      {/* Current Game Progress */}
      <Card className="bg-white/95 border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Current Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Guesses Used</span>
              <span>{guesses} / {maxGuesses}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {wordLength}
            </div>
            <div className="text-sm text-gray-600">Letter Word</div>
          </div>

          {gameStatus !== 'playing' && (
            <div className={`text-center p-3 rounded-lg ${
              gameStatus === 'won' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className="font-semibold">
                {gameStatus === 'won' ? '🎉 Victory!' : '💔 Better luck next time!'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <Card className="bg-white/95 border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-600">Games Won</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">73%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                <Star className="w-5 h-5" />
                500
              </div>
              <div className="text-sm text-gray-600">Word Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">4.2</div>
              <div className="text-sm text-gray-600">Avg Guesses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guess Distribution */}
      <Card className="bg-white/95 border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Guess Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((guessNum) => (
            <div key={guessNum} className="flex items-center gap-2">
              <div className="w-4 text-sm text-gray-600 font-medium">{guessNum}</div>
              <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.random() * 80 + 10}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {Math.floor(Math.random() * 25 + 5)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-white/95 border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Start with words containing common vowels</div>
            <div>• Use common consonants like R, S, T, L, N</div>
            <div>• Pay attention to letter positioning</div>
            <div>• Eliminate impossible letters early</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStats;
