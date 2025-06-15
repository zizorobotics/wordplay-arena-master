
// Word lists for different lengths
const WORDS_4 = [
  'WORD', 'GAME', 'PLAY', 'LOVE', 'TIME', 'LIFE', 'HOPE', 'BLUE', 'FIRE', 'STAR',
  'MOON', 'TREE', 'BIRD', 'FISH', 'ROCK', 'WIND', 'RAIN', 'SNOW', 'GOLD', 'RUBY',
  'CAKE', 'BOOK', 'DOOR', 'WALL', 'ROOM', 'DESK', 'LAMP', 'CART', 'BOAT', 'PLAN'
];

const WORDS_5 = [
  'ABOUT', 'WORLD', 'HOUSE', 'MIGHT', 'AFTER', 'EVERY', 'THINK', 'WHERE', 'BEING',
  'STILL', 'PLACE', 'RIGHT', 'GREAT', 'SMALL', 'FOUND', 'THOSE', 'NEVER', 'UNDER',
  'AGAIN', 'WHILE', 'THESE', 'FIRST', 'COULD', 'WATER', 'WORDS', 'SOUND', 'LIGHT',
  'YEARS', 'LATER', 'POWER', 'MUSIC', 'BOOKS', 'PAPER', 'STORY', 'YOUNG', 'HAPPY'
];

const WORDS_6 = [
  'SHOULD', 'AROUND', 'BEFORE', 'TURNED', 'PEOPLE', 'LITTLE', 'MOTHER', 'FATHER',
  'SCHOOL', 'CHANGE', 'FRIEND', 'FAMILY', 'GARDEN', 'WINDOW', 'LISTEN', 'SIMPLE',
  'FUTURE', 'BRIGHT', 'STRONG', 'PRETTY', 'PURPLE', 'ORANGE', 'YELLOW', 'WINTER',
  'SUMMER', 'SPRING', 'LEAVES', 'FLOWER', 'NATURE', 'ANIMAL', 'PLANET', 'GALAXY'
];

const WORD_LISTS = {
  4: WORDS_4,
  5: WORDS_5,
  6: WORDS_6
};

export const getRandomWord = (length: number): string => {
  const words = WORD_LISTS[length as keyof typeof WORD_LISTS] || WORDS_5;
  return words[Math.floor(Math.random() * words.length)];
};

export const isValidWord = (word: string): boolean => {
  const length = word.length;
  const words = WORD_LISTS[length as keyof typeof WORD_LISTS];
  if (!words) return false;
  return words.includes(word.toUpperCase());
};

export const checkGuess = (guess: string, target: string): ('correct' | 'present' | 'absent')[] => {
  const result: ('correct' | 'present' | 'absent')[] = [];
  const targetArray = target.split('');
  const guessArray = guess.toUpperCase().split('');
  
  // First pass: mark correct letters
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] === targetArray[i]) {
      result[i] = 'correct';
      targetArray[i] = '_'; // Mark as used
      guessArray[i] = '_'; // Mark as processed
    }
  }
  
  // Second pass: mark present letters
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] !== '_') {
      const targetIndex = targetArray.indexOf(guessArray[i]);
      if (targetIndex !== -1) {
        result[i] = 'present';
        targetArray[targetIndex] = '_'; // Mark as used
      } else {
        result[i] = 'absent';
      }
    }
  }
  
  return result;
};

// Generate game statistics
export const calculateStats = (games: { won: boolean; guesses: number }[]) => {
  const totalGames = games.length;
  const wonGames = games.filter(game => game.won).length;
  const winRate = totalGames > 0 ? Math.round((wonGames / totalGames) * 100) : 0;
  
  const guessDistribution = [0, 0, 0, 0, 0, 0]; // Index 0 = 1 guess, etc.
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  games.forEach((game, index) => {
    if (game.won) {
      guessDistribution[game.guesses - 1]++;
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
      if (index === games.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
      if (index === games.length - 1) {
        currentStreak = 0;
      }
    }
  });
  
  const avgGuesses = wonGames > 0 
    ? games.filter(g => g.won).reduce((sum, g) => sum + g.guesses, 0) / wonGames 
    : 0;
  
  return {
    totalGames,
    winRate,
    currentStreak,
    maxStreak,
    avgGuesses: Math.round(avgGuesses * 10) / 10,
    guessDistribution
  };
};
