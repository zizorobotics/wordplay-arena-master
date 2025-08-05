import 'package:supabase/supabase.dart';

/// A service class to encapsulate logic for managing and retrieving game words
/// from the Supabase database.
class WordService {
  WordService({required this.supabase});

  final SupabaseClient supabase;

  /// Retrieves a random word of a specified length from the `words` table.
  ///
  /// This method calls a PostgreSQL function `get_random_word` via RPC,
  /// which is more efficient than fetching all words and selecting one in Dart.
  /// Throws an [Exception] if no word can be fetched.
  Future<String> getWord({required int length}) async {
    try {
      final response = await supabase.rpc(
        'get_random_word',
        params: {'word_len': length},
      );

      if (response == null || (response as List).isEmpty) {
        throw Exception('No word of length $length found in the database.');
      }
      // The RPC is expected to return a list with a single object: [{'word': 'HELLO'}]
      return (response.first as Map<String, dynamic>)['word'] as String;
    } catch (e) {
      print('[ERROR] WordService.getWord: $e');
      // Fallback or rethrow a more specific error
      throw Exception('Failed to retrieve a word from the database.');
    }
  }

  /// Validates if a given word exists in the `words` table.
  ///
  /// This is used for a quick check before processing a full guess,
  /// preventing invalid words from being submitted.
  Future<bool> isValidWord(String word) async {
    try {
      final response = await supabase
          .from('words')
          .select('word')
          .eq('word', word.toUpperCase())
          .limit(1)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('[ERROR] WordService.isValidWord: $e');
      // If the database check fails, assume the word is invalid for safety.
      return false;
    }
  }
}
