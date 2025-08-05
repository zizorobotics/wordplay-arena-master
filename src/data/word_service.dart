/// A service class to encapsulate logic for managing and retrieving game words.
/// In a real application, this would connect to a dedicated 'words' table
/// in the database, which could have columns for difficulty, category, etc.
class WordService {
  // For now, we use a simple hardcoded map.
  // This structure allows for easy expansion with different word lists.
  static final Map<int, List<String>> _wordLists = {
    4: ['WORD', 'GAME', 'PLAY', 'LOVE', 'TIME', 'LIFE', 'HOPE'],
    5: ['ABOUT', 'WORLD', 'HOUSE', 'MIGHT', 'AFTER', 'EVERY', 'THINK'],
    6: ['SHOULD', 'AROUND', 'BEFORE', 'PEOPLE', 'LITTLE', 'MOTHER', 'FATHER'],
  };

  /// Retrieves a random word of a specified length.
  /// 
  /// Throws an [ArgumentError] if no words are available for the given length.
  String getWord({required int length}) {
    final list = _wordLists[length];
    if (list == null || list.isEmpty) {
      throw ArgumentError('No words available for length: $length');
    }
    // Shuffles the list and returns the first element for randomness.
    (list..shuffle());
    return list.first;
  }

  /// Validates if a given word exists in our lists.
  /// This can be used for a quick check without affecting game state.
  Future<bool> isValidWord(String word) async {
    final length = word.length;
    final list = _wordLists[length];
    if (list == null) {
      return false;
    }
    // In a real app, this might be a `select` query to the database.
    // e.g., supabase.from('words').select().eq('word', word.toUpperCase()).maybeSingle();
    return list.contains(word.toUpperCase());
  }
}
