/// This file contains the Dart classes that model the data structures
/// used throughout the game. They are used for serialization and
/// ensuring type safety when interacting with the database and API.
/// The `fromJson` and `toJson` methods are essential for converting
/// between Dart objects and JSON for API communication.

class GameState {
  GameState({
    required this.id,
    required this.status,
    required this.players,
    required this.targetWord,
    required this.wordLength,
    required this.maxGuesses,
    this.currentPlayerId,
    this.winnerId,
  });

  final String id;
  final String status;
  final Map<String, Player> players;
  final String targetWord;
  final int wordLength;
  final int maxGuesses;
  final String? currentPlayerId;
  final String? winnerId;

  factory GameState.fromJson(Map<String, dynamic> json) {
    return GameState(
      id: json['id'] as String,
      status: json['status'] as String,
      players: (json['players'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, Player.fromJson(value as Map<String, dynamic>)),
      ),
      targetWord: json['target_word'] as String,
      wordLength: json['word_length'] as int,
      maxGuesses: json['max_guesses'] as int,
      currentPlayerId: json['current_player_id'] as String?,
      winnerId: json['winner_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status,
      'players': players.map((key, value) => MapEntry(key, value.toJson())),
      'target_word': targetWord,
      'word_length': wordLength,
      'max_guesses': maxGuesses,
      'current_player_id': currentPlayerId,
      'winner_id': winnerId,
    };
  }
}

class Player {
  Player({
    required this.id,
    required this.name,
    required this.guesses,
    required this.score,
  });

  final String id;
  final String name;
  final List<PlayerGuess> guesses;
  final int score;

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'] as String,
      name: json['name'] as String,
      guesses: (json['guesses'] as List<dynamic>)
          .map((e) => PlayerGuess.fromJson(e as Map<String, dynamic>))
          .toList(),
      score: json['score'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'guesses': guesses.map((e) => e.toJson()).toList(),
      'score': score,
    };
  }
}

class PlayerGuess {
  PlayerGuess({required this.word, required this.result});

  final String word;
  final List<String> result; // 'correct', 'present', 'absent'

  factory PlayerGuess.fromJson(Map<String, dynamic> json) {
    return PlayerGuess(
      word: json['word'] as String,
      result: (json['result'] as List<dynamic>).cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'result': result,
    };
  }
}
