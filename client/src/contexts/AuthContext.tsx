import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';

// Load Supabase credentials from client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in client environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and functions to the entire app.
 * It listens to Supabase's auth state changes and makes the current
 * user and session available to all child components.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up a real-time listener for authentication state changes
  useEffect(() => {
    // Immediately try to get the current session to set the initial state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for future changes, e.g., when the user logs in or out in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Triggers the GitHub OAuth sign-in flow.
   * Supabase handles the redirect and session management.
   */
  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
    if (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  /**
   * Signs the user out of the application.
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    signInWithGithub,
    logout,
  };

  // The context provider doesn't render any UI until the initial auth
  // state has been loaded.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook to easily access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
