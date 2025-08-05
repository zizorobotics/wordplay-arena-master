import 'package:supabase/supabase.dart';
import 'package:dotenv/dotenv.dart';

// Load environment variables
final env = DotEnv()..load();
 
// Create Supabase client instance
final supabase = SupabaseClient(
  env['SUPABASE_URL'] ?? '',
  env['SUPABASE_ANON_KEY'] ?? '',
); 