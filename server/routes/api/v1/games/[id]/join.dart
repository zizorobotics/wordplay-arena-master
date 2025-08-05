import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/game/game_service.dart';

/// Handles a second player's request to join an existing private game.
///
/// It uses the [GameService] to add the player to the specified game,
/// update the game status to 'playing', and notify all clients in the
/// game's real-time channel.
Future<Response> onRequest(RequestContext context, String id) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  // Read dependencies from the context.
  final supabase = context.read<SupabaseClient>();
  final joiningUser = context.read<User>();
  final gameService = GameService(supabase: supabase);

  try {
    // Delegate the complex logic to the service layer.
    final updatedGameState = await gameService.addPlayerAndStartGame(
      gameId: id,
      user: joiningUser,
    );

    return Response.json(body: {'gameState': updatedGameState});
  } on GameServiceException catch (e) {
    // Handle specific, known errors from the service (e.g., "Game is full").
    return Response(statusCode: e.statusCode, body: e.message);
  } catch (e) {
    print('[ERROR] /games/$id/join: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while trying to join the game.',
    );
  }
}
