import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  gems: number;
  win_streak: number;
  total_games: number;
  total_wins: number;
  is_anonymous: boolean;
  auth_provider: string;
}

interface AnonymousUser {
  id: string;
  username: string;
  gems: number;
  win_streak: number;
  total_games: number;
  total_wins: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | AnonymousUser | null;
  isAnonymous: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateGems: (newGems: number) => Promise<void>;
  updateStats: (gameWon: boolean, newStreak?: number) => Promise<void>;
  getClientIP: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | AnonymousUser | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedIP, setCachedIP] = useState<string | null>(null);
  const { toast } = useToast();

  // Get client IP (cached to prevent multiple calls)
  const getClientIP = async (): Promise<string> => {
    if (cachedIP) return cachedIP;
    
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setCachedIP(data.ip);
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      const fallbackIP = '127.0.0.1';
      setCachedIP(fallbackIP);
      return fallbackIP;
    }
  };

  // Get or create anonymous user using our server API
  const getOrCreateAnonymousUser = async (ipAddress: string): Promise<AnonymousUser> => {
    try {
      // Use our server's anonymous user service
      const response = await fetch('http://localhost:8085/api/v1/anonymous/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          username: data.username,
          gems: data.gems,
          win_streak: data.win_streak,
          total_games: data.total_games,
          total_wins: data.total_wins,
        };
      }
    } catch (error) {
      console.error('Error getting anonymous user from server:', error);
    }

    // Fallback: create a simple anonymous user based on IP hash
    const ipHash = ipAddress.split('.').map(Number).reduce((a, b) => a + b, 0);
    const anonymousId = (100000 + (ipHash % 900000)).toString();
    
    return {
      id: anonymousId,
      username: `Anonymous${anonymousId}`,
      gems: 10,
      win_streak: 0,
      total_games: 0,
      total_wins: 0,
    };
  };

  // Update anonymous user stats
  const updateAnonymousStats = async (
    ipAddress: string,
    gameWon: boolean,
    newGems?: number,
    newStreak?: number
  ): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8085/api/v1/anonymous/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress,
          gameWon,
          newGems,
          newStreak,
        }),
      });

      if (response.ok) {
        // Update local state
        if (profile && !('is_anonymous' in profile)) {
          setProfile(prev => prev ? {
            ...prev,
            gems: newGems ?? prev.gems,
            win_streak: newStreak ?? prev.win_streak,
            total_games: prev.total_games + 1,
            total_wins: prev.total_wins + (gameWon ? 1 : 0),
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating anonymous stats:', error);
    }
  };

  // Convert anonymous user to registered user
  const convertAnonymousToRegistered = async (ipAddress: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8085/api/v1/anonymous/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress,
          registeredUserId: userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error converting anonymous user:', error);
      return false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setIsAnonymous(false);

      // Create new anonymous user after sign out
      const ipAddress = await getClientIP();
      const anonymousUser = await getOrCreateAnonymousUser(ipAddress);
      setProfile(anonymousUser);
      setIsAnonymous(true);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update gems
  const updateGems = async (newGems: number): Promise<void> => {
    try {
      if (isAnonymous && profile) {
        const ipAddress = await getClientIP();
        await updateAnonymousStats(ipAddress, false, newGems);
      } else if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ gems: newGems })
          .eq('id', user.id);

        if (error) throw error;
      }

      setProfile(prev => prev ? { ...prev, gems: newGems } : null);
    } catch (error) {
      console.error('Error updating gems:', error);
    }
  };

  // Update stats
  const updateStats = async (gameWon: boolean, newStreak?: number): Promise<void> => {
    try {
      if (isAnonymous && profile) {
        const ipAddress = await getClientIP();
        await updateAnonymousStats(ipAddress, gameWon, undefined, newStreak);
      } else {
        const updates: Record<string, number> = {
          total_games: profile!.total_games + 1,
          total_wins: profile!.total_wins + (gameWon ? 1 : 0),
        };

        if (newStreak !== undefined) {
          updates.win_streak = newStreak;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user?.id);

        if (error) throw error;
      }

      setProfile(prev => prev ? {
        ...prev,
        win_streak: newStreak ?? prev.win_streak,
        total_games: prev.total_games + 1,
        total_wins: prev.total_wins + (gameWon ? 1 : 0),
      } : null);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (profileData) {
            setProfile(profileData);
            setIsAnonymous(false);
          } else {
            // Create profile for new user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player',
                email: session.user.email,
                gems: 10,
                auth_provider: 'google',
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
            setIsAnonymous(false);
          }
        } else {
          // No authenticated user, create anonymous user
          const ipAddress = await getClientIP();
          const anonymousUser = await getOrCreateAnonymousUser(ipAddress);
          setProfile(anonymousUser);
          setIsAnonymous(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Fallback to anonymous user
        const ipAddress = await getClientIP();
        const anonymousUser = await getOrCreateAnonymousUser(ipAddress);
        setProfile(anonymousUser);
        setIsAnonymous(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Convert anonymous user to registered if needed
          if (isAnonymous && profile) {
            const ipAddress = await getClientIP();
            await convertAnonymousToRegistered(ipAddress, session.user.id);
          }

          // Get or create profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting profile:', profileError);
          }

          if (profileData) {
            setProfile(profileData);
            setIsAnonymous(false);
          } else {
            // Create profile for new user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player',
                email: session.user.email,
                gems: 10,
                auth_provider: 'google',
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              setProfile(newProfile);
              setIsAnonymous(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAnonymous(false);
          
          // Create new anonymous user
          const ipAddress = await getClientIP();
          const anonymousUser = await getOrCreateAnonymousUser(ipAddress);
          setProfile(anonymousUser);
          setIsAnonymous(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isAnonymous, profile]);

  const value: AuthContextType = {
    user,
    profile,
    isAnonymous,
    isLoading,
    signInWithGoogle,
    signOut,
    updateGems,
    updateStats,
    getClientIP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};