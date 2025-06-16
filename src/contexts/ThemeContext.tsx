
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
  {
    id: 'purple',
    name: 'Purple Dream',
    colors: {
      correct: 'bg-purple-500',
      present: 'bg-violet-400',
      absent: 'bg-gray-500',
      empty: 'bg-purple-50 border-purple-200',
      current: 'bg-purple-200 border-purple-400'
    },
    background: 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700',
    font: 'font-serif'
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    colors: {
      correct: 'bg-rose-500',
      present: 'bg-pink-400',
      absent: 'bg-gray-500',
      empty: 'bg-rose-50 border-rose-200',
      current: 'bg-rose-200 border-rose-400'
    },
    background: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600',
    font: 'font-sans'
  }
];

interface ThemeContextType {
  currentTheme: WordleTheme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<WordleTheme>(themes[0]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
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
