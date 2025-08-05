import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/data/supabase_client.dart';

// This middleware runs for every request that comes into the server.
// Its primary jobs are to provide dependencies to the request context
// and to handle top-level logging.

Handler middleware(Handler handler) {
  return (context) async {
    // Handle CORS preflight requests
    if (context.request.method.value == 'OPTIONS') {
      return Response(
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      );
    }

    // 1. Provide the Supabase client instance to all routes.
    // This uses a dependency injection pattern where any downstream route
    // can access the Supabase client via context.read<SupabaseClient>().
    final response = await handler
        .use(provider<SupabaseClient>((context) => supabase))
        .call(context);
        
    // 2. Add CORS headers to all responses
    final headers = Map<String, String>.from(response.headers);
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    // 3. Log the request details after the handler has finished.
    // This is useful for debugging and monitoring server activity.
    print(
      '[${response.statusCode}] ${context.request.method.value} ${context.request.uri.path}',
    );
    
    return response.copyWith(headers: headers);
  };
}