import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/game/game_service.dart';

/// Handles a player's guess submission for a specific game.
///
/// This endpoint is the core of the gameplay loop. It validates the move,
/// updates the game state, calculates scores, and broadcasts the new state,
/// all by delegating the complex logic to the [GameService].
Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  // Read dependencies and request payload.
  final supabase = context.read<SupabaseClient>();
  final user = context.read<User>();
  final body = await context.request.json() as Map<String, dynamic>;
  final guess = (body['guess'] as String? ?? '').toUpperCase();

  if (guess.isEmpty) {
    return Response(statusCode: HttpStatus.badRequest, body: 'Guess cannot be empty.');
  }

  final gameService = GameService(supabase: supabase);

  try {
    // Delegate the complex move logic to the service.
    final updatedGame = await gameService.submitMove(
      gameId: id,
      userId: user.id,
      guess: guess,
    );
    
    return Response.json(body: {'gameState': updatedGame});
  } on GameServiceException catch (e) {
    // Handle specific game errors (e.g., "Not your turn").
    return Response(statusCode: e.statusCode, body: e.message);
  } catch (e) {
    print('[ERROR] /games/$id/move: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while processing the move.',
    );
  }
}
