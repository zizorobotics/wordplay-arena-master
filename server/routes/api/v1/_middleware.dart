import 'package:dart_frog/dart_frog.dart';
import 'package:supabase/supabase.dart';

// This middleware protects all routes under `/api/v1`.
// It checks for a valid JSON Web Token (JWT) in the request headers.

Handler middleware(Handler handler) {
  return (context) async {
    // Allow public access to matchmaking, anonymous user, and debug endpoints
    if (context.request.uri.path == '/api/v1/matchmaking/join' ||
        context.request.uri.path.startsWith('/api/v1/anonymous/') ||
        context.request.uri.path.startsWith('/api/v1/debug/')) {
      // For these endpoints, we allow anonymous access
      return handler.use(provider<User?>((_) => null)).call(context);
    }
    
    // For other endpoints, require authentication
    final authHeader = context.request.headers['Authorization'];
    
    if (authHeader == null || !authHeader.startsWith('Bearer ')) {
      return Response(statusCode: 401, body: 'Unauthorized: No token provided');
    }

    final token = authHeader.replaceFirst('Bearer ', '');
    final supabase = context.read<SupabaseClient>();

    try {
      // Use the Supabase client to validate the token
      final userResponse = await supabase.auth.getUser(token);
      
      if (userResponse.user == null) {
        return Response(statusCode: 401, body: 'Unauthorized: Invalid token');
      }

      // If the token is valid, add the user object to the context.
      // Downstream routes can now access the authenticated user's information.
      return handler.use(provider<User>((_) => userResponse.user!)).call(context);

    } catch (e) {
      print('Token validation error: $e');
      return Response(statusCode: 401, body: 'Unauthorized: Token validation failed');
    }
  };
}