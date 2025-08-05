import 'dart:math';
import 'package:supabase/supabase.dart';

/// Service for managing anonymous users with 6-digit IDs
class AnonymousUserService {
  AnonymousUserService({required this.supabase});

  final SupabaseClient supabase;
  final Random _random = Random();

  /// Generate a unique 6-digit anonymous user ID
  String _generateAnonymousId() {
    return (_random.nextInt(900000) + 100000).toString(); // 100000-999999
  }

  /// Get or create an anonymous user based on IP address
  Future<Map<String, dynamic>> getOrCreateAnonymousUser(String ipAddress) async {
    try {
      // First, try to find existing anonymous user by IP
      final existingUser = await supabase
          .from('anonymous_users')
          .select()
          .eq('ip_address', ipAddress)
          .maybeSingle();

      if (existingUser != null) {
        // Update last seen timestamp
        await supabase
            .from('anonymous_users')
            .update({'last_seen': DateTime.now().toIso8601String()})
            .eq('id', existingUser['id']);
        
        return existingUser;
      }

      // Create new anonymous user
      final anonymousId = _generateAnonymousId();
      final newUser = {
        'id': anonymousId,
        'username': 'Anonymous$anonymousId',
        'ip_address': ipAddress,
        'gems': 10,
        'win_streak': 0,
        'total_games': 0,
        'total_wins': 0,
        'created_at': DateTime.now().toIso8601String(),
        'last_seen': DateTime.now().toIso8601String(),
      };

      await supabase.from('anonymous_users').insert(newUser);
      return newUser;
    } catch (e) {
      print('Error in getOrCreateAnonymousUser: $e');
      rethrow;
    }
  }

  /// Update anonymous user stats
  Future<void> updateAnonymousStats(String anonymousId, {
    int? gems,
    int? winStreak,
    int? totalGames,
    int? totalWins,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (gems != null) updates['gems'] = gems;
      if (winStreak != null) updates['win_streak'] = winStreak;
      if (totalGames != null) updates['total_games'] = totalGames;
      if (totalWins != null) updates['total_wins'] = totalWins;
      updates['last_seen'] = DateTime.now().toIso8601String();

      await supabase
          .from('anonymous_users')
          .update(updates)
          .eq('id', anonymousId);
    } catch (e) {
      print('Error updating anonymous stats: $e');
      rethrow;
    }
  }

  /// Convert anonymous user to registered user
  Future<void> convertAnonymousToRegistered(String anonymousId, String registeredUserId) async {
    try {
      // Get anonymous user data
      final anonymousUser = await supabase
          .from('anonymous_users')
          .select()
          .eq('id', anonymousId)
          .single();

      // Update registered user profile with anonymous user stats
      await supabase
          .from('profiles')
          .update({
            'gems': anonymousUser['gems'],
            'win_streak': anonymousUser['win_streak'],
            'total_games': anonymousUser['total_games'],
            'total_wins': anonymousUser['total_wins'],
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', registeredUserId);

      // Delete anonymous user
      await supabase
          .from('anonymous_users')
          .delete()
          .eq('id', anonymousId);
    } catch (e) {
      print('Error converting anonymous to registered: $e');
      rethrow;
    }
  }
} 