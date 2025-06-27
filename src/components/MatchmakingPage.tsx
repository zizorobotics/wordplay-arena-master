
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Search, Clock, Zap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface MatchmakingPageProps {
  wordLength: number;
  onBack: () => void;
  onPlayerFound: () => void;
}

const MatchmakingPage = ({ wordLength, onBack, onPlayerFound }: MatchmakingPageProps) => {
  const [isSearching, setIsSearching] = useState(true);
  const [dots, setDots] = useState('');
  const { currentTheme, isTransitioning } = useTheme();

  // Get current game mode from URL or context - for now we'll use a generic title
  const getGameModeTitle = () => {
    // You could pass gameMode as a prop if needed, for now using generic title
    return "Multiplayer Match";
  };

  const getGameModeIcon = () => {
    // Default to Users icon for all multiplayer modes
    return Users;
  };

  // Animate dots for loading effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Simulate finding a player after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
      setTimeout(() => {
        onPlayerFound();
      }, 1000); // Small delay to show "Player Found!" message
    }, 5000);

    return () => clearTimeout(timer);
  }, [onPlayerFound]);

  const IconComponent = getGameModeIcon();

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
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
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{getGameModeTitle()}</h1>
            <p className="text-blue-100">Word Length: {wordLength} letters</p>
          </div>

          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Matchmaking Card */}
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="bg-white/95 border-0 shadow-2xl max-w-md w-full">
            <CardContent className="p-12 text-center">
              {isSearching ? (
                <>
                  {/* Searching Animation */}
                  <div className="mb-8">
                    <div className="relative">
                      <Search className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Finding an opponent{dots}
                  </h2>
                  
                  <p className="text-gray-600 mb-8">
                    Searching for players ready to battle
                  </p>

                  {/* Loading Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>

                  {/* Player Count Simulation */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>1,247 players online</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Player Found Animation */}
                  <div className="mb-8">
                    <div className="relative">
                      <IconComponent className="w-16 h-16 text-green-500 mx-auto animate-scale-in" />
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-green-600 mb-4 animate-fade-in">
                    Player Found!
                  </h2>
                  
                  <p className="text-gray-600 mb-8 animate-fade-in">
                    Preparing the battle arena...
                  </p>

                  {/* Success Animation */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center text-blue-100 mt-8">
          <p className="text-sm">
            {isSearching ? 
              "We'll match you with a player of similar skill level" : 
              "Starting game in a moment..."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;
