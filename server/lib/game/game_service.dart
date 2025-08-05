import 'dart:io';
import 'package:supabase/supabase.dart';
import 'package:uuid/uuid.dart';
import 'package:wordle_ultimate_server/data/word_service.dart';
import 'package:wordle_ultimate_server/data/anonymous_user_service.dart';
import 'package:wordle_ultimate_server/game/scoring_service.dart';

/// A custom exception class to handle specific game-related errors
/// with appropriate HTTP status codes.
class GameServiceException implements Exception {
  GameServiceException(this.message, {this.statusCode = 400});
  final String message;
  final int statusCode;
}

/// Represents the result of a matchmaking operation.
class MatchResult {
  MatchResult({
    required this.gameId,
    required this.gameState,
    required this.wasGameCreated,
  });
  final String gameId;
  final Map<String, dynamic> gameState;
  final bool wasGameCreated;
}

/// A service that centralizes all game lifecycle and business logic.
/// It interacts with the database and other services to manage game state.
class GameService {
  GameService({required this.supabase})
      : _wordService = WordService(supabase: supabase),
        _scoringService = ScoringService(),
        _anonymousUserService = AnonymousUserService(supabase: supabase);

  final SupabaseClient supabase;
  final WordService _wordService;
  final ScoringService _scoringService;
  final AnonymousUserService _anonymousUserService;

  /// Finds an available game to join or creates a new one.
  Future<MatchResult> findOrCreateMatch({
    required User? user,
    required int wordLength,
    String? ipAddress,
  }) async {
    // Handle anonymous user creation if needed
    String? anonymousUserId;
    if (user == null && ipAddress != null) {
      final anonymousUser = await _anonymousUserService.getOrCreateAnonymousUser(ipAddress);
      anonymousUserId = anonymousUser['id'] as String;
    }

    // This should be a transaction in a real-world scenario using RPC.
    final waitingGames = await supabase
        .from('games')
        .select()
        .eq('status', 'waiting')
        .eq('word_length', wordLength)
        .limit(1)
        .maybeSingle();

    if (waitingGames != null) {
      final gameId = waitingGames['id'] as String;
      final gameState = await addPlayerAndStartGame(
        gameId: gameId, 
        user: user, 
        anonymousUserId: anonymousUserId,
      );
      return MatchResult(
        gameId: gameId,
        gameState: gameState,
        wasGameCreated: false,
      );
    } else {
      final newGame = await createNewGame(
        creator: user, 
        wordLength: wordLength,
        anonymousUserId: anonymousUserId,
      );
      return MatchResult(
        gameId: newGame['id'] as String,
        gameState: newGame,
        wasGameCreated: true,
      );
    }
  }

  /// Creates a new game record in the database.
  Future<Map<String, dynamic>> createNewGame({
    required User? creator,
    required int wordLength,
    String? anonymousUserId,
  }) async {
    final gameId = const Uuid().v4();
    final targetWord = await _wordService.getWord(length: wordLength);

    final playerId = creator?.id ?? anonymousUserId ?? 'unknown';
    final playerName = creator?.userMetadata?['full_name'] ?? 
                      creator?.email?.split('@')[0] ?? 
                      'Anonymous$anonymousUserId';
    
    final initialGameState = {
      'id': gameId,
      'target_word': targetWord,
      'word_length': wordLength,
      'max_guesses': 6,
      'status': 'waiting',
      'current_player_id': playerId,
      'players': creator != null ? {
        playerId: {
          'id': playerId,
          'name': playerName,
          'score': 0,
          'guesses': []
        }
      } : {},
      'anonymous_players': creator == null && anonymousUserId != null ? {
        anonymousUserId: {
          'id': anonymousUserId,
          'name': playerName,
          'score': 0,
          'guesses': []
        }
      } : {},
      'turn_history': [],
      'created_at': DateTime.now().toIso8601String(),
      'updated_at': DateTime.now().toIso8601String(),
    };

    final result = await supabase.from('games').insert(initialGameState).select().single();
    return result;
  }

  /// Adds a player to an existing game and starts it.
  Future<Map<String, dynamic>> addPlayerAndStartGame({
    required String gameId,
    required User? user,
    String? anonymousUserId,
  }) async {
    final game = await supabase.from('games').select().eq('id', gameId).single();
    
    if (user != null) {
      final players = game['players'] as Map<String, dynamic>;
      if (players.containsKey(user.id)) return game; // Already in game
      if (players.length >= 2) {
        throw GameServiceException('Game is full.', statusCode: HttpStatus.conflict);
      }
      players[user.id] = {
        'id': user.id, 
        'name': user.userMetadata?['full_name'] ?? user.email?.split('@')[0] ?? 'Player 2', 
        'score': 0, 
        'guesses': []
      };
      game['players'] = players;
    } else if (anonymousUserId != null) {
      final anonymousPlayers = game['anonymous_players'] as Map<String, dynamic>;
      if (anonymousPlayers.containsKey(anonymousUserId)) return game; // Already in game
      if (anonymousPlayers.length >= 2) {
        throw GameServiceException('Game is full.', statusCode: HttpStatus.conflict);
      }
      anonymousPlayers[anonymousUserId] = {
        'id': anonymousUserId, 
        'name': 'Anonymous$anonymousUserId', 
        'score': 0, 
        'guesses': []
      };
      game['anonymous_players'] = anonymousPlayers;
    }
    
    game['status'] = 'playing';

    final updatedGame = await supabase.from('games').update(game).eq('id', gameId).select().single();

    // Broadcast the updated state to all clients in the room
    await _broadcastUpdate(gameId, updatedGame);

    return updatedGame;
  }

  /// Processes a player's move, validates it, updates state, and broadcasts.
  Future<Map<String, dynamic>> submitMove({
    required String gameId,
    required String userId,
    required String guess,
  }) async {
    final game = await supabase.from('games').select().eq('id', gameId).single();

    if (game['current_player_id'] != userId) {
      throw GameServiceException('Not your turn.', statusCode: HttpStatus.forbidden);
    }
    if (guess.length != game['word_length']) {
      throw GameServiceException('Invalid guess length.');
    }

    final targetWord = game['target_word'] as String;
    final guessResult = _scoringService.checkGuess(guess, targetWord);
    final score = _scoringService.calculateScore(guessResult);

    // Check both regular players and anonymous players
    final players = game['players'] as Map<String, dynamic>;
    final anonymousPlayers = game['anonymous_players'] as Map<String, dynamic>;
    
    Map<String, dynamic> currentPlayer;
    if (players.containsKey(userId)) {
      currentPlayer = players[userId] as Map<String, dynamic>;
    } else if (anonymousPlayers.containsKey(userId)) {
      currentPlayer = anonymousPlayers[userId] as Map<String, dynamic>;
    } else {
      throw GameServiceException('Player not found in game.');
    }

    (currentPlayer['guesses'] as List).add({'word': guess, 'result': guessResult});
    currentPlayer['score'] = (currentPlayer['score'] as int) + score;
    (game['turn_history'] as List).add({'playerId': userId, 'guess': guess});
    
    // Switch turns - check both player types
    final allPlayerIds = <String>[];
    allPlayerIds.addAll(players.keys);
    allPlayerIds.addAll(anonymousPlayers.keys);
    
    game['current_player_id'] = allPlayerIds.firstWhere((id) => id != userId, orElse: () => userId);

    // Check win/loss
    if (guess == targetWord) {
      game['status'] = 'finished';
      game['winner_id'] = userId;
    } else if ((currentPlayer['guesses'] as List).length >= game['max_guesses']) {
      game['status'] = 'finished';
    }

    final updatedGame = await supabase.from('games').update(game).eq('id', gameId).select().single();
    
    await _broadcastUpdate(gameId, updatedGame);
    return updatedGame;
  }

  /// Helper to broadcast game state to the appropriate channel.
  Future<void> _broadcastUpdate(String gameId, Map<String, dynamic> gameState) {
    // For now, just log the update instead of broadcasting
    // TODO: Implement proper real-time broadcasting when Supabase Realtime is set up
    print('Game update for $gameId: $gameState');
    return Future.value();
  }
}
