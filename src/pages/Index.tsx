import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Users, Clock, Target, Zap, Trophy, Star, Gem, Settings, Search, Loader2, User, LogOut, Crown } from "lucide-react";
import GameBoard from "@/components/GameBoard";
import RealtimeGame from "@/components/RealtimeGame";
import TurnBasedGame from "@/components/TurnBasedGame";
import CooperativeGame from "@/components/CooperativeGame";
import GemsDisplay from "@/components/GemsDisplay";
import AdDisplay from "@/components/AdDisplay";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// This would be a unique ID for the logged-in user
const MOCK_USER_ID = `user_${crypto.randomUUID()}`;

const Index = () => {
  const [gameState, setGameState] = useState<{ mode: string; sessionId: string } | null>(null);
  const [wordLength, setWordLength] = useState(5);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingDots, setMatchmakingDots] = useState('');
  const [matchmakingTimeLeft, setMatchmakingTimeLeft] = useState(20);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentTheme, isTransitioning } = useTheme();
  const { profile, isAnonymous, signOut, isLoading, getClientIP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Abort controller to cancel fetch requests if user cancels matchmaking
  const matchmakingAbortController = useRef<AbortController | null>(null);

  // Animate dots and countdown for loading effect
  useEffect(() => {
    if (isMatchmaking) {
      const dotsInterval = setInterval(() => {
        setMatchmakingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      
      const countdownInterval = setInterval(() => {
        setMatchmakingTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(dotsInterval);
        clearInterval(countdownInterval);
      };
    } else {
      setMatchmakingTimeLeft(20); // Reset countdown when not matchmaking
    }
  }, [isMatchmaking]);

  const handleStartMatchmaking = useCallback(async (mode: string) => {
    setIsMatchmaking(true);
    setMatchmakingTimeLeft(20); // Reset countdown
    matchmakingAbortController.current = new AbortController();
    const { signal } = matchmakingAbortController.current;

    // Set a 20-second timeout for matchmaking
    matchmakingTimeoutRef.current = setTimeout(() => {
        if (matchmakingAbortController.current) {
            matchmakingAbortController.current.abort(); // Abort the fetch request
            setIsMatchmaking(false);
            toast({
                title: "Matchmaking Timed Out",
                description: "No players were found. Please try again.",
                variant: "destructive",
            });
        }
    }, 20000); // 20 seconds

    try {
      // Simulate realistic matchmaking delay (8-18 seconds)
      const matchmakingDelay = Math.random() * 10000 + 8000; // 8-18 seconds
      
      // Add delay BEFORE making the API call to simulate searching
      await new Promise(resolve => setTimeout(resolve, matchmakingDelay));

      if(signal.aborted) return;

      // Get IP address for anonymous users
      const ipAddress = await getClientIP();
      
      // Real API call to matchmaking endpoint
      const response = await fetch('http://localhost:8085/api/v1/matchmaking/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode, 
          wordLength, 
          userId: profile?.id || MOCK_USER_ID,
          ipAddress: isAnonymous ? ipAddress : undefined 
        }),
        signal,
      });

      if(signal.aborted) return;

      if (!response.ok) {
        throw new Error('Failed to join matchmaking');
      }

      const { sessionId } = await response.json();

      if (matchmakingTimeoutRef.current) {
        clearTimeout(matchmakingTimeoutRef.current);
      }
      
      setGameState({ mode, sessionId });
      setIsMatchmaking(false);

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("Matchmaking failed:", error);
        toast({
            title: "Matchmaking Error",
            description: "Could not connect to the matchmaking service.",
            variant: "destructive"
        });
        setIsMatchmaking(false);
      }
    }
  }, [wordLength, toast, getClientIP, profile?.id, isAnonymous]);

  const handleCancelMatchmaking = () => {
    if (matchmakingTimeoutRef.current) {
      clearTimeout(matchmakingTimeoutRef.current);
    }
    if (matchmakingAbortController.current) {
        matchmakingAbortController.current.abort();
    }
    setIsMatchmaking(false);
    toast({ title: "Matchmaking Canceled" });
  };
  
  const handleBackFromGame = () => {
    setGameState(null);
  };

  // Render the appropriate game screen if a game is active
  if (gameState) {
    switch (gameState.mode) {
      case 'solo':
        return <GameBoard gameMode="solo" wordLength={wordLength} onBack={handleBackFromGame} />;
      case 'realtime':
        return <RealtimeGame wordLength={wordLength} sessionId={gameState.sessionId} onBack={handleBackFromGame} />;
      case 'turnbased':
        return <TurnBasedGame wordLength={wordLength} sessionId={gameState.sessionId} currentUserId={MOCK_USER_ID} onBack={handleBackFromGame} />;
      case 'cooperative':
        return <CooperativeGame wordLength={wordLength} sessionId={gameState.sessionId} currentUserId={MOCK_USER_ID} onBack={handleBackFromGame} />;
      default:
        return null;
    }
  }

  const gameModeOptions = [
    { id: 'solo', title: 'Solo Play', description: 'Classic Wordle experience', icon: Target, color: 'bg-blue-500', available: true },
    { id: 'realtime', title: '1v1 Real-Time', description: 'Race against another player', icon: Zap, color: 'bg-red-500', available: true },
    { id: 'turnbased', title: '1v1 Turn-Based', description: 'Take turns guessing strategically', icon: Clock, color: 'bg-yellow-500', available: true },
    { id: 'cooperative', title: 'Cooperative', description: 'Work together to solve one puzzle', icon: Users, color: 'bg-green-500', available: true }
  ];

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.font} p-4 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-4xl mx-auto relative">
        <div className={`transition-all duration-300 ${isMatchmaking ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">Word<span className="text-yellow-300">Ultimate</span></h1>
            <p className="text-xl text-blue-100">The ultimate multiplayer Wordle experience.</p>
          </div>

          {/* User Header */}
          {!isLoading && profile && (
            <div className="absolute top-8 right-8">
              <Card className="bg-white/95 border-0 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-800">
                        {profile.username}
                      </span>
                      {isAnonymous && (
                        <Badge variant="secondary" className="text-xs">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gem className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-gray-800">{profile.gems}</span>
                    </div>
                    {isAnonymous ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/signin')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Sign In
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Word Length Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">Choose Word Length</h2>
            <div className="flex justify-center gap-4">
              {[4, 5, 6].map(length => (
                <Button key={length} variant={wordLength === length ? "default" : "outline"} onClick={() => setWordLength(length)} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 ${wordLength === length ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}>
                  {length} Letters
                </Button>
              ))}
            </div>
          </div>

          {/* Game Modes */}
          <div className="grid md:grid-cols-2 gap-6">
            {gameModeOptions.map(mode => (
              <Card key={mode.id} className="relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl"
                onClick={() => mode.id === 'solo' ? setGameState({ mode: 'solo', sessionId: '' }) : handleStartMatchmaking(mode.id)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${mode.color} text-white`}><mode.icon className="w-6 h-6" /></div>
                    <CardTitle className="text-xl text-gray-800">{mode.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">{mode.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Matchmaking Overlay */}
        {isMatchmaking && (
          <div className="absolute inset-0 flex items-center justify-center z-50 -mt-20">
            <Card className="bg-white/95 border-0 shadow-2xl max-w-md w-full mx-4">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin mb-8" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Finding a Match{matchmakingDots}</h2>
                <p className="text-gray-600 mb-4">This will take up to 20 seconds.</p>
                <div className="text-lg font-semibold text-blue-600 mb-8">
                  Time remaining: {matchmakingTimeLeft}s
                </div>
                <Button onClick={handleCancelMatchmaking} variant="outline" className="mt-6">Cancel</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Ad Display */}
      <div className="fixed bottom-4 left-4 z-40">
        <AdDisplay 
          adSlot="YOUR_AD_SLOT_ID" 
          adFormat="rectangle" 
          className="w-300 h-250"
        />
      </div>
      
      {/* Gems Display */}
      <GemsDisplay showStats={true} />
    </div>
  );
};

export default Index;