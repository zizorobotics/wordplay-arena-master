import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Gem, Crown, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
  const { profile, isAnonymous, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleBackToGame = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Card className="bg-white/95 border-0 shadow-2xl max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Button
            variant="ghost"
            onClick={handleBackToGame}
            className="absolute top-8 left-8 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Word<span className="text-yellow-300">Ultimate</span>
          </h1>
          <p className="text-xl text-blue-100">Sign in to save your progress</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Sign In Card */}
          <Card className="bg-white/95 border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Connect with Google to save your progress and compete with friends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Stats Card */}
          <Card className="bg-white/95 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Your Current Progress</CardTitle>
              <CardDescription className="text-gray-600">
                {isAnonymous ? 'Anonymous Player' : 'Guest Player'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gems */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-gray-800">Gems</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{profile?.gems || 0}</span>
              </div>

              {/* Win Streak */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Win Streak</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{profile?.win_streak || 0}</span>
              </div>

              {/* Win Rate */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800">Win Rate</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {profile && profile.total_games > 0 
                    ? Math.round((profile.total_wins / profile.total_games) * 100)
                    : 0}%
                </span>
              </div>

              {/* Total Games */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-800">Total Games</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{profile?.total_games || 0}</span>
              </div>

              {/* Anonymous Badge */}
              {isAnonymous && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <Badge variant="secondary" className="w-full justify-center">
                    Anonymous Player - Sign in to save progress
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why Sign In?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/95 border-0 shadow-xl text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Save Progress</h3>
                <p className="text-gray-600">Keep your gems, streaks, and stats across all devices</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-0 shadow-xl text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Play with Friends</h3>
                <p className="text-gray-600">Challenge friends and compete on leaderboards</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-0 shadow-xl text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Earn Rewards</h3>
                <p className="text-gray-600">Unlock achievements and special features</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 