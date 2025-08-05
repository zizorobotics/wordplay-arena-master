import 'dart:io';
import 'package:dart_frog/dart_frog.dart' hide HttpMethod;

// Simple in-memory storage for active users (for debugging only)
final Set<String> activeIPs = <String>{};
final Map<String, DateTime> lastSeen = <String, DateTime>{};

/// Debug endpoint to track active users
Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  // Get client IP from request
  final clientIP = context.request.headers['x-forwarded-for'] ?? 
                   context.request.headers['x-real-ip'] ?? 
                   'unknown';

  // Add to active users
  activeIPs.add(clientIP);
  lastSeen[clientIP] = DateTime.now();

  // Clean up old entries (older than 5 minutes)
  final fiveMinutesAgo = DateTime.now().subtract(Duration(minutes: 5));
  activeIPs.removeWhere((ip) => lastSeen[ip]?.isBefore(fiveMinutesAgo) ?? true);

  // Return current active users
  final activeUsers = activeIPs.map((ip) => {
    'ip': ip,
    'lastSeen': lastSeen[ip]?.toIso8601String(),
  }).toList();

  return Response.json(body: {
    'activeUsers': activeUsers,
    'totalActive': activeUsers.length,
    'timestamp': DateTime.now().toIso8601String(),
  });
} 