import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/data/anonymous_user_service.dart';

/// Handles anonymous user stats updates.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.put) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final supabase = context.read<SupabaseClient>();
  final body = await context.request.json() as Map<String, dynamic>;
  
  final ipAddress = body['ipAddress'] as String?;
  final gameWon = body['gameWon'] as bool? ?? false;
  final newGems = body['newGems'] as int?;
  final newStreak = body['newStreak'] as int?;

  if (ipAddress == null) {
    return Response(
      statusCode: HttpStatus.badRequest,
      body: 'IP address is required.',
    );
  }

  final anonymousUserService = AnonymousUserService(supabase: supabase);

  try {
    // First get the anonymous user to get their ID
    final anonymousUser = await anonymousUserService.getOrCreateAnonymousUser(ipAddress);
    
    // Update their stats
    await anonymousUserService.updateAnonymousStats(
      anonymousUser['id'] as String,
      gems: newGems,
      winStreak: newStreak,
      totalGames: 1, // Increment by 1
      totalWins: gameWon ? 1 : 0, // Increment by 1 if won
    );
    
    return Response.json(body: { 'success': true });
  } catch (e) {
    print('[ERROR] /anonymous/stats: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while updating stats.',
    );
  }
} 