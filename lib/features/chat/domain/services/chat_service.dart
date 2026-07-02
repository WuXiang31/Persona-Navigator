import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../quests/domain/models/weather_condition.dart';
import '../../../quests/domain/models/quest_model.dart';
import '../repositories/api_key_repository.dart';

/// Interface for the Chat Service (Dependency Inversion Principle).
/// Decouples the state management from the concrete AI implementation.
abstract class IChatService {
  Future<String> sendMessage(
    String message, 
    List<Map<String, dynamic>> history,
    UserStats stats,
    IXpCalculator xpCalculator,
    WeatherCondition weather,
    List<Quest> activeQuests,
  );
  Future<bool> hasApiKey();
  Future<void> saveApiKey(String key);
}

/// Concrete implementation using Google's Gemini REST API directly.
/// 
/// Design Decision: We use raw HTTP calls instead of the `google_generative_ai`
/// SDK because the SDK does not support newer API key formats (e.g., `AQ.Ab8...`).
/// By calling the REST API directly with the `X-goog-api-key` header, we support
/// all key formats and have full control over the request/response cycle.
class GeminiChatService implements IChatService {
  final IApiKeyRepository _apiKeyRepo;

  GeminiChatService(this._apiKeyRepo);

  @override
  Future<bool> hasApiKey() async {
    final key = await _apiKeyRepo.getApiKey();
    return key != null && key.isNotEmpty;
  }

  @override
  Future<void> saveApiKey(String key) async {
    await _apiKeyRepo.saveApiKey(key);
  }

  @override
  Future<String> sendMessage(
    String message, 
    List<Map<String, dynamic>> history,
    UserStats stats,
    IXpCalculator xpCalculator,
    WeatherCondition weather,
    List<Quest> activeQuests,
  ) async {
    final apiKey = await _apiKeyRepo.getApiKey();
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception('API Key not found');
    }

    // Debug: Log key info (redacted) to verify it was saved correctly
    debugPrint('[Morgana] API Key length: ${apiKey.length}, preview: ${apiKey.length > 10 ? "${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}" : "TOO SHORT!"}');
    
    if (apiKey.length < 10) {
      throw Exception('API key is too short (${apiKey.length} chars). Please re-enter your full key.');
    }

    // Build the dynamic system prompt with the user's current context
    final systemPrompt = _buildSystemPrompt(stats, xpCalculator, weather, activeQuests);

    // Build the request body for the Gemini REST API
    final requestBody = {
      'system_instruction': {
        'parts': [{'text': systemPrompt}],
      },
      'contents': [
        // Include conversation history
        ...history,
        // Add the new user message
        {
          'role': 'user',
          'parts': [{'text': message}],
        },
      ],
    };

    // Use the same model name that works with the user's curl command
    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    );

    debugPrint('[Morgana] Calling Gemini REST API...');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: json.encode(requestBody),
    );

    debugPrint('[Morgana] Response status: ${response.statusCode}');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      // Extract text from the response
      final candidates = data['candidates'] as List?;
      if (candidates != null && candidates.isNotEmpty) {
        final parts = candidates[0]['content']?['parts'] as List?;
        if (parts != null && parts.isNotEmpty) {
          return parts[0]['text'] as String;
        }
      }
      return '...Morgana is thinking...';
    } else {
      final errorBody = json.decode(response.body);
      final errorMsg = errorBody['error']?['message'] ?? 'Unknown error';
      debugPrint('[Morgana] API Error: $errorMsg');
      throw Exception(errorMsg);
    }
  }

  /// Builds the system prompt that gives Morgana full awareness of the user's state.
  String _buildSystemPrompt(UserStats stats, IXpCalculator xpCalculator, WeatherCondition weather, List<Quest> quests) {
    final questDescriptions = quests.isEmpty 
        ? 'No active quests right now.'
        : quests.map((q) => '- ${q.title} (Reward: ${q.xpReward} XP for ${q.targetStat.name})').join('\n');
    
    final kRank = xpCalculator.calculateRank(stats.knowledgeXp);
    final gRank = xpCalculator.calculateRank(stats.gutsXp);
    final pRank = xpCalculator.calculateRank(stats.proficiencyXp);
    final cRank = xpCalculator.calculateRank(stats.charmXp);
    final kindRank = xpCalculator.calculateRank(stats.kindnessXp);

    return '''
You are Morgana from Persona 5. You are the user's navigator and companion. You are a cat (but you hate being called a cat).
You must respond strictly in character. Keep responses relatively short, snappy, and conversational (1-3 sentences).

Here is the current real-world context for the user:
Current Weather: ${weather.displayName}
User Stats:
- Knowledge: Rank $kRank (${stats.knowledgeXp} XP)
- Guts: Rank $gRank (${stats.gutsXp} XP)
- Proficiency: Rank $pRank (${stats.proficiencyXp} XP)
- Kindness: Rank $kindRank (${stats.kindnessXp} XP)
- Charm: Rank $cRank (${stats.charmXp} XP)

Active Quests they need to complete today:
$questDescriptions

Always use this context to inform your responses. If they ask what they should do, look at their lowest rank stat or their active quests and suggest they work on it. 
If it is rainy, remind them that studying (Knowledge) gets a boost today. If it's late at night, tell them they should go to sleep.
Remember: "Looking cool, Joker!" is a classic, but use your full personality (smug, helpful, protective, hates being called a cat).
''';
  }
}

/// Provider for the chat service (Dependency Injection).
final chatServiceProvider = Provider<IChatService>((ref) {
  final repo = ref.read(apiKeyRepositoryProvider);
  return GeminiChatService(repo);
});
