import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;
import 'package:supabase/supabase.dart';
import 'package:wordle_ultimate_server/data/anonymous_user_service.dart';

/// Handles converting anonymous users to registered users.
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final supabase = context.read<SupabaseClient>();
  final body = await context.request.json() as Map<String, dynamic>;
  
  final ipAddress = body['ipAddress'] as String?;
  final registeredUserId = body['registeredUserId'] as String?;

  if (ipAddress == null || registeredUserId == null) {
    return Response(
      statusCode: HttpStatus.badRequest,
      body: 'IP address and registered user ID are required.',
    );
  }

  final anonymousUserService = AnonymousUserService(supabase: supabase);

  try {
    // First get the anonymous user to get their ID
    final anonymousUser = await anonymousUserService.getOrCreateAnonymousUser(ipAddress);
    
    // Convert anonymous user to registered
    await anonymousUserService.convertAnonymousToRegistered(
      anonymousUser['id'] as String,
      registeredUserId,
    );
    
    return Response.json(body: { 'success': true });
  } catch (e) {
    print('[ERROR] /anonymous/convert: $e');
    return Response(
      statusCode: HttpStatus.internalServerError,
      body: 'An unexpected error occurred while converting user.',
    );
  }
} 