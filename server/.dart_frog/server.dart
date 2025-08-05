// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, implicit_dynamic_list_literal

import 'dart:io';

import 'package:dart_frog/dart_frog.dart';


import '../routes/index.dart' as index;
import '../routes/api/v1/matchmaking/join.dart' as api_v1_matchmaking_join;
import '../routes/api/v1/games/create.dart' as api_v1_games_create;
import '../routes/api/v1/games/[id]/move.dart' as api_v1_games_$id_move;
import '../routes/api/v1/games/[id]/join.dart' as api_v1_games_$id_join;
import '../routes/api/v1/anonymous/user.dart' as api_v1_anonymous_user;
import '../routes/api/v1/anonymous/stats.dart' as api_v1_anonymous_stats;
import '../routes/api/v1/anonymous/convert.dart' as api_v1_anonymous_convert;

import '../routes/_middleware.dart' as middleware;
import '../routes/api/v1/_middleware.dart' as api_v1_middleware;

void main() async {
  final address = InternetAddress.tryParse('') ?? InternetAddress.anyIPv6;
  final port = int.tryParse(Platform.environment['PORT'] ?? '8085') ?? 8085;
  hotReload(() => createServer(address, port));
}

Future<HttpServer> createServer(InternetAddress address, int port) {
  final handler = Cascade().add(buildRootHandler()).handler;
  return serve(handler, address, port);
}

Handler buildRootHandler() {
  final pipeline = const Pipeline().addMiddleware(middleware.middleware);
  final router = Router()
    ..mount('/api/v1/anonymous', (context) => buildApiV1AnonymousHandler()(context))
    ..mount('/api/v1/games/<id>', (context,id,) => buildApiV1Games$idHandler(id,)(context))
    ..mount('/api/v1/games', (context) => buildApiV1GamesHandler()(context))
    ..mount('/api/v1/matchmaking', (context) => buildApiV1MatchmakingHandler()(context))
    ..mount('/', (context) => buildHandler()(context));
  return pipeline.addHandler(router);
}

Handler buildApiV1AnonymousHandler() {
  final pipeline = const Pipeline().addMiddleware(api_v1_middleware.middleware);
  final router = Router()
    ..all('/user', (context) => api_v1_anonymous_user.onRequest(context,))..all('/stats', (context) => api_v1_anonymous_stats.onRequest(context,))..all('/convert', (context) => api_v1_anonymous_convert.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildApiV1Games$idHandler(String id,) {
  final pipeline = const Pipeline().addMiddleware(api_v1_middleware.middleware);
  final router = Router()
    ..all('/move', (context) => api_v1_games_$id_move.onRequest(context,id,))..all('/join', (context) => api_v1_games_$id_join.onRequest(context,id,));
  return pipeline.addHandler(router);
}

Handler buildApiV1GamesHandler() {
  final pipeline = const Pipeline().addMiddleware(api_v1_middleware.middleware);
  final router = Router()
    ..all('/create', (context) => api_v1_games_create.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildApiV1MatchmakingHandler() {
  final pipeline = const Pipeline().addMiddleware(api_v1_middleware.middleware);
  final router = Router()
    ..all('/join', (context) => api_v1_matchmaking_join.onRequest(context,));
  return pipeline.addHandler(router);
}

Handler buildHandler() {
  final pipeline = const Pipeline();
  final router = Router()
    ..all('/', (context) => index.onRequest(context,));
  return pipeline.addHandler(router);
}

