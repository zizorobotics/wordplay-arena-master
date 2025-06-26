
export interface GuessScore {
  greenLetters: number;
  yellowLetters: number;
  baseScore: number;
  timeBonus: number;
  totalScore: number;
  timeTaken: number;
}

export interface PlayerScoring {
  currentScore: number;
  lastGuessScore: GuessScore | null;
  guessStartTime: number;
}

// Base points for different achievements
const SCORING_CONFIG = {
  GREEN_LETTER_BASE: 50,    // Base points per correct letter in correct position
  YELLOW_LETTER_BASE: 20,   // Base points per correct letter in wrong position
  MAX_TIME_BONUS: 100,      // Maximum time bonus points
  TIME_PENALTY_START: 10,   // Time in seconds where penalty starts (under this = bonus)
  TIME_PENALTY_MAX: 60,     // Time in seconds where penalty maxes out
  COMBO_MULTIPLIER: 1.2,    // Multiplier when you have both green and yellow
  PERFECT_GUESS_BONUS: 200, // Bonus for getting all letters correct
};

/**
 * Calculates the score for a single guess based on results and time taken
 */
export const calculateGuessScore = (
  guessResult: ('correct' | 'present' | 'absent')[],
  timeTaken: number
): GuessScore => {
  const greenLetters = guessResult.filter(result => result === 'correct').length;
  const yellowLetters = guessResult.filter(result => result === 'present').length;
  
  // Base score calculation
  let baseScore = (greenLetters * SCORING_CONFIG.GREEN_LETTER_BASE) + 
                  (yellowLetters * SCORING_CONFIG.YELLOW_LETTER_BASE);
  
  // Perfect guess bonus
  if (greenLetters === guessResult.length) {
    baseScore += SCORING_CONFIG.PERFECT_GUESS_BONUS;
  }
  
  // Combo bonus for having both green and yellow letters
  if (greenLetters > 0 && yellowLetters > 0) {
    baseScore = Math.floor(baseScore * SCORING_CONFIG.COMBO_MULTIPLIER);
  }
  
  // Time bonus/penalty calculation
  let timeBonus = 0;
  if (timeTaken <= SCORING_CONFIG.TIME_PENALTY_START) {
    // Fast guess bonus (exponentially better for faster guesses)
    const speedRatio = (SCORING_CONFIG.TIME_PENALTY_START - timeTaken) / SCORING_CONFIG.TIME_PENALTY_START;
    timeBonus = Math.floor(SCORING_CONFIG.MAX_TIME_BONUS * Math.pow(speedRatio, 0.5));
  } else if (timeTaken > SCORING_CONFIG.TIME_PENALTY_START) {
    // Slow guess penalty (linear penalty up to max time)
    const penaltyRatio = Math.min(
      (timeTaken - SCORING_CONFIG.TIME_PENALTY_START) / 
      (SCORING_CONFIG.TIME_PENALTY_MAX - SCORING_CONFIG.TIME_PENALTY_START),
      1
    );
    timeBonus = -Math.floor(SCORING_CONFIG.MAX_TIME_BONUS * penaltyRatio * 0.5);
  }
  
  const totalScore = Math.max(0, baseScore + timeBonus);
  
  return {
    greenLetters,
    yellowLetters,
    baseScore,
    timeBonus,
    totalScore,
    timeTaken
  };
};

/**
 * Formats the score breakdown for display
 */
export const formatScoreBreakdown = (score: GuessScore): string => {
  const parts = [];
  
  if (score.greenLetters > 0) {
    parts.push(`${score.greenLetters} Green (${score.greenLetters * SCORING_CONFIG.GREEN_LETTER_BASE}pts)`);
  }
  
  if (score.yellowLetters > 0) {
    parts.push(`${score.yellowLetters} Yellow (${score.yellowLetters * SCORING_CONFIG.YELLOW_LETTER_BASE}pts)`);
  }
  
  if (score.timeBonus > 0) {
    parts.push(`Speed Bonus (+${score.timeBonus}pts)`);
  } else if (score.timeBonus < 0) {
    parts.push(`Time Penalty (${score.timeBonus}pts)`);
  }
  
  return parts.join(' • ');
};

/**
 * Gets a performance rating based on score
 */
export const getPerformanceRating = (score: GuessScore): { 
  rating: string; 
  color: string; 
  emoji: string 
} => {
  if (score.totalScore >= 400) return { rating: 'LEGENDARY', color: 'text-purple-600', emoji: '🏆' };
  if (score.totalScore >= 300) return { rating: 'EXCELLENT', color: 'text-yellow-600', emoji: '⭐' };
  if (score.totalScore >= 200) return { rating: 'GREAT', color: 'text-green-600', emoji: '🎯' };
  if (score.totalScore >= 100) return { rating: 'GOOD', color: 'text-blue-600', emoji: '👍' };
  if (score.totalScore >= 50) return { rating: 'OKAY', color: 'text-orange-600', emoji: '👌' };
  return { rating: 'NEEDS WORK', color: 'text-red-600', emoji: '💪' };
};
