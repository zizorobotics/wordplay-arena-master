import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WordleTheme {
  id: string;
  name: string;
  colors: {
    correct: string;
    present: string;
    absent: string;
    empty: string;
    current: string;
  };
  background: string;
  font: string;
}

export const themes: WordleTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    colors: {
      correct: 'bg-green-500',
      present: 'bg-yellow-500',
      absent: 'bg-gray-500',
      empty: 'bg-gray-100 border-gray-300',
      current: 'bg-blue-100 border-blue-300'
    },
    background: 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800',
    font: 'font-sans'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      correct: 'bg-teal-500',
      present: 'bg-cyan-400',
      absent: 'bg-slate-500',
      empty: 'bg-blue-50 border-blue-200',
      current: 'bg-blue-200 border-blue-400'
    },
    background: 'bg-gradient-to-br from-cyan-500 via-teal-600 to-blue-800',
    font: 'font-sans'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      correct: 'bg-orange-500',
      present: 'bg-amber-400',
      absent: 'bg-gray-600',
      empty: 'bg-orange-50 border-orange-200',
      current: 'bg-orange-200 border-orange-400'
    },
    background: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600',
    font: 'font-serif'
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      correct: 'bg-emerald-600',
      present: 'bg-lime-500',
      absent: 'bg-stone-500',
      empty: 'bg-green-50 border-green-200',
      current: 'bg-green-200 border-green-400'
    },
    background: 'bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800',
    font: 'font-mono'
  },
];

interface ThemeContextType {
  currentTheme: WordleTheme;
  setTheme: (themeId: string) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentThemeState] = useState<WordleTheme>(() => {
    try {
      const storedThemeId = localStorage.getItem('wordle-theme');
      return themes.find(t => t.id === storedThemeId) || themes[0];
    } catch (error) {
      console.error("Could not access localStorage, defaulting to classic theme.", error);
      return themes[0];
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme && theme.id !== currentTheme.id) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentThemeState(theme);
        try {
          localStorage.setItem('wordle-theme', theme.id);
        } catch (error) {
          console.error("Could not save theme to localStorage", error);
        }
        
        setTimeout(() => setIsTransitioning(false), 50);
      }, 150);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
