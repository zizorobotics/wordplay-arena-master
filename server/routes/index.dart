import 'package:dart_frog/dart_frog.dart';

/// A simple health check endpoint for the server.
///
/// When a request is made to the root path (`/`), this function responds
/// with a 200 OK status and a welcome message, confirming that the
/// Dart Frog server is running correctly.
Response onRequest(RequestContext context) {
  return Response.json(
    body: {
      'status': 'ok',
      'message': 'Welcome to the Wordle Ultimate API Server!',
    },
  );
}
