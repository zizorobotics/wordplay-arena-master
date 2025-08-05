import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/data/anonymous_user_service.dart';

/// Handles anonymous user creation and retrieval.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final supabase = context.read<SupabaseClient>();
  final body = await context.request.json() as Map<String, dynamic>;
  final ipAddress = body['ipAddress'] as String?;

  if (ipAddress == null) {
    return Response(
      statusCode: HttpStatus.badRequest,
      body: 'IP address is required.',
    );
  }

  final anonymousUserService = AnonymousUserService(supabase: supabase);

  try {
    final anonymousUser = await anonymousUserService.getOrCreateAnonymousUser(ipAddress);
    
    return Response.json(body: anonymousUser);
  } catch (e) {
    print('[ERROR] /anonymous/user: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while creating anonymous user.',
    );
  }
} 