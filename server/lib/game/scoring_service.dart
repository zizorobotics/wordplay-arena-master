/// A service class dedicated to handling all game-related scoring logic.
///
/// This centralizes the rules for how points are awarded, making the system
/// consistent and easy to tune.
class ScoringService {
  // Configuration for scoring points. This can be easily adjusted.
  static const _greenLetterPoints = 50;
  static const _yellowLetterPoints = 20;

  /// Validates a player's guess against the target word.
  ///
  /// Returns a list of strings representing the status of each letter:
  /// 'correct', 'present', or 'absent'.
  List<String> checkGuess(String guess, String target) {
    final result = List.filled(target.length, 'absent');
    final targetChars = target.split('');
    final guessChars = guess.split('');
    final usedTargetIndices = List.filled(target.length, false);

    // First pass: Mark all 'correct' letters (right letter, right position).
    for (var i = 0; i < target.length; i++) {
      if (guessChars[i] == targetChars[i]) {
        result[i] = 'correct';
        usedTargetIndices[i] = true;
      }
    }

    // Second pass: Mark 'present' letters (right letter, wrong position).
    for (var i = 0; i < target.length; i++) {
      if (result[i] == 'correct') {
        continue;
      }

      for (var j = 0; j < target.length; j++) {
        if (!usedTargetIndices[j] && guessChars[i] == targetChars[j]) {
          result[i] = 'present';
          usedTargetIndices[j] = true;
          break; // Avoid matching the same letter twice.
        }
      }
    }
    return result;
  }

  /// Calculates the score for a single guess based on the results.
  ///
  /// [guessResult] is a list of statuses ('correct', 'present', 'absent').
  /// A time bonus could be added here in the future.
  int calculateScore(List<String> guessResult) {
    var score = 0;
    for (final result in guessResult) {
      if (result == 'correct') {
        score += _greenLetterPoints;
      } else if (result == 'present') {
        score += _yellowLetterPoints;
      }
    }
    return score;
  }
}
