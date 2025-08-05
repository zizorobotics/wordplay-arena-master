import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/game/game_service.dart';

/// Handles the creation of a new game session, typically for private matches.
///
/// This endpoint delegates the core logic to the [GameService] to ensure
/// separation of concerns, keeping the route handler clean and focused on
/// handling the HTTP request and response.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  // Read dependencies and request payload from the context.
  final supabase = context.read<SupabaseClient>();
  final user = context.read<User>();
  final body = await context.request.json() as Map<String, dynamic>;
  final wordLength = body['wordLength'] as int? ?? 5;

  // Instantiate the service that contains the core business logic.
  final gameService = GameService(supabase: supabase);

  try {
    // Delegate the actual game creation logic to the service.
    final newGame = await gameService.createNewGame(
      creator: user,
      wordLength: wordLength,
    );

    // Return the newly created game object to the client.
    return Response.json(
      statusCode: HttpStatus.created, // Use 201 for resource creation.
      body: {'gameId': newGame['id'], 'initialState': newGame},
    );
  } catch (e) {
    print('[ERROR] /games/create: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while creating the game.',
    );
  }
}
