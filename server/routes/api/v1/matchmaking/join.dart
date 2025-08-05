import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/game/game_service.dart';

/// Handles matchmaking requests for finding or creating games.
///
/// This endpoint is the entry point for players wanting to join a game.
/// It either finds an existing waiting game or creates a new one.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  // Read dependencies and request payload.
  final supabase = context.read<SupabaseClient>();
  final user = context.read<User?>();
  final body = await context.request.json() as Map<String, dynamic>;
  
  final wordLength = body['wordLength'] as int? ?? 5;
  final ipAddress = body['ipAddress'] as String?;

  if (wordLength < 3 || wordLength > 8) {
    return Response(
      statusCode: HttpStatus.badRequest,
      body: 'Word length must be between 3 and 8 characters.',
    );
  }

  final gameService = GameService(supabase: supabase);

  try {
    // Delegate the complex matchmaking logic to the service.
    final matchResult = await gameService.findOrCreateMatch(
      user: user,
      wordLength: wordLength,
      ipAddress: ipAddress,
    );
    
    return Response.json(body: {
      'gameId': matchResult.gameId,
      'gameState': matchResult.gameState,
      'wasGameCreated': matchResult.wasGameCreated,
      'status': 'success',
    });
  } on GameServiceException catch (e) {
    // Handle specific game errors (e.g., "Game is full").
    return Response(statusCode: e.statusCode, body: e.message);
  } catch (e) {
    print('[ERROR] /matchmaking/join: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred during matchmaking.',
    );
  }
}
