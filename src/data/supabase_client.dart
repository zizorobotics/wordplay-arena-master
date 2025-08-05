import 'package:supabase/supabase.dart';
import 'package:dotenv/dotenv.dart' show env;

// This file is responsible for initializing the Supabase client.
// It should be the only place where environment variables for Supabase are accessed.

// Load environment variables from a .env file at the root of the /server directory.
// Make sure to add .env to your .gitignore file.
final _env = env..load();

final _supabaseUrl = _env['SUPABASE_URL'];
final _supabaseAnonKey = _env['SUPABASE_ANON_KEY'];

// Check if the environment variables are set.
void _ensureEnvVariables() {
  if (_supabaseUrl == null) {
    throw Exception('SUPABASE_URL is not set in your .env file.');
  }
  if (_supabaseAnonKey == null) {
    throw Exception('SUPABASE_ANON_KEY is not set in your .env file.');
  }
}

/// A singleton instance of the SupabaseClient.
///
/// This instance is initialized once and can be used throughout the server
/// to interact with the Supabase backend.
/// Usage: `import 'package:wordle_ultimate_server/src/data/supabase_client.dart';`
/// and then simply use the `supabase` variable.
final supabase = () {
  _ensureEnvVariables();
  return SupabaseClient(_supabaseUrl!, _supabaseAnonKey!);
}();

// A new GameService class to handle game logic, which we will define later.
class GameService {
    GameService({required this.supabase});
    final SupabaseClient supabase;
    
    Future<Map<String,dynamic>> addPlayerAndStartGame({required String gameId, required User user}) async {
        // Placeholder for implementation
        return {};
    }

    Future<Map<String,dynamic>> createNewGame({required User creator, required int wordLength}) async {
        // Placeholder for implementation
        return {};
    }
}