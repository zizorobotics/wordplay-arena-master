import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Gem, Crown, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GemsDisplayProps {
  className?: string;
  showStats?: boolean;
}

const GemsDisplay: React.FC<GemsDisplayProps> = ({ className = '', showStats = false }) => {
  const { profile, isAnonymous } = useAuth();

  if (!profile) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <Card className="bg-white/95 border-0 shadow-lg backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Gems Display */}
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-lg text-gray-800">
                {profile.gems}
              </span>
              <Badge variant="secondary" className="text-xs">
                {isAnonymous ? 'Anonymous' : 'Gems'}
              </Badge>
            </div>

            {/* Stats Display (optional) */}
            {showStats && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                <div className="flex items-center gap-4">
                  {/* Win Streak */}
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {profile.win_streak}
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {profile.total_games > 0 
                        ? Math.round((profile.total_wins / profile.total_games) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GemsDisplay; 