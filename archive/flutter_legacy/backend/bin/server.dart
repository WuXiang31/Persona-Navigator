import 'dart:convert';
import 'dart:io';

import 'package:dotenv/dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_router/shelf_router.dart';

// Configure routes.
final _router = Router()
  ..get('/', _rootHandler)
  ..post('/chat', _chatHandler);

Response _rootHandler(Request req) {
  return Response.ok('Morgana Backend Proxy is running!\n');
}

Future<Response> _chatHandler(Request req) async {
  // Read API Key from environment
  final env = DotEnv(includePlatformEnvironment: true)..load();
  final apiKey = env['GEMINI_API_KEY'];

  if (apiKey == null || apiKey.isEmpty) {
    return Response.internalServerError(
      body: jsonEncode({'error': 'GEMINI_API_KEY not configured on server.'}),
      headers: {'content-type': 'application/json'},
    );
  }

  try {
    // Read the incoming JSON body from the Flutter client
    final payload = await req.readAsString();
    final decoded = jsonDecode(payload) as Map<String, dynamic>;

    // We can intercept or validate the payload here.
    // For now, we just pass the Gemini structure directly to Google.
    final requestBody = {
      'system_instruction': decoded['system_instruction'],
      'contents': decoded['contents'],
    };

    // Forward the request to Google Gemini API
    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    );

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: jsonEncode(requestBody),
    );

    // Return Google's exact response to the client
    return Response(
      response.statusCode,
      body: response.body,
      headers: {'content-type': 'application/json'},
    );
  } catch (e) {
    return Response.internalServerError(
      body: jsonEncode({'error': e.toString()}),
      headers: {'content-type': 'application/json'},
    );
  }
}

void main(List<String> args) async {
  // Use any available host or IPv4 loopback.
  final ip = InternetAddress.anyIPv4;

  // Configure a pipeline that logs requests.
  final handler = Pipeline().addMiddleware(logRequests()).addHandler(_router.call);

  // For running in containers, we respect the PORT environment variable.
  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await serve(handler, ip, port);
  
  print('Server listening on port ${server.port}');
}
