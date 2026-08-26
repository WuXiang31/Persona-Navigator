import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../quests/domain/models/weather_condition.dart';
import '../../../quests/domain/models/quest_model.dart';

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
  Future<(StatType, int)> autoDecideQuest(String title);
}

/// Concrete implementation that communicates with our Backend Proxy.
class ProxyChatService implements IChatService {
  @override
  Future<bool> hasApiKey() async {
    // The backend proxy handles the API key, so the client is always ready.
    return true;
  }

  @override
  Future<void> saveApiKey(String key) async {
    // No-op. API keys are not stored on the client anymore.
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
    // Build the dynamic system prompt with the user's current context
    final systemPrompt = _buildSystemPrompt(stats, xpCalculator, weather, activeQuests);

    // Build the request body for the Proxy Server
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

    // Use PROXY_URL from --dart-define, fallback to localhost for development
    const proxyUrl = String.fromEnvironment('PROXY_URL', defaultValue: 'http://localhost:8080/chat');
    final url = Uri.parse(proxyUrl);

    debugPrint('[Morgana] Calling Backend Proxy at $proxyUrl...');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode(requestBody),
    );

    debugPrint('[Morgana] Proxy Response status: ${response.statusCode}');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      // Extract text from the response (standard Gemini format)
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
      final errorMsg = errorBody['error'] ?? 'Unknown error connecting to Proxy';
      debugPrint('[Morgana] Proxy Error: $errorMsg');
      throw Exception(errorMsg);
    }
  }

  @override
  Future<(StatType, int)> autoDecideQuest(String title) async {
    final systemPrompt = '''
You are Morgana from Persona 5. 
The user wants to add a new custom quest: "$title".
Determine the most appropriate Stat category (knowledge, guts, proficiency, kindness, charm) and a fair XP reward (an integer between 10 and 100).
You MUST output ONLY a valid JSON object. No markdown, no backticks, no extra text.
Example: {"stat": "guts", "xp": 75}
''';

    final requestBody = {
      'system_instruction': {
        'parts': [{'text': systemPrompt}],
      },
      'contents': [
        {
          'role': 'user',
          'parts': [{'text': 'Quest title: $title'}],
        },
      ],
    };

    const proxyUrl = String.fromEnvironment('PROXY_URL', defaultValue: 'http://localhost:8080/chat');
    final url = Uri.parse(proxyUrl);

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode(requestBody),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final candidates = data['candidates'] as List?;
      if (candidates != null && candidates.isNotEmpty) {
        final parts = candidates[0]['content']?['parts'] as List?;
        if (parts != null && parts.isNotEmpty) {
          String text = parts[0]['text'] as String;
          text = text.trim();
          if (text.startsWith('```')) {
            final match = RegExp(r'```(?:json)?\s*(\{.*?\})\s*```', dotAll: true).firstMatch(text);
            if (match != null) {
              text = match.group(1)!;
            }
          }
          final jsonResponse = json.decode(text);
          final statStr = (jsonResponse['stat'] as String).toLowerCase();
          final xp = (jsonResponse['xp'] as num).toInt();
          
          StatType stat;
          switch (statStr) {
            case 'guts': stat = StatType.guts; break;
            case 'proficiency': stat = StatType.proficiency; break;
            case 'kindness': stat = StatType.kindness; break;
            case 'charm': stat = StatType.charm; break;
            case 'knowledge': 
            default:
              stat = StatType.knowledge; 
              break;
          }
          return (stat, xp);
        }
      }
      return (StatType.knowledge, 50);
    } else {
      throw Exception('Failed to auto-decide quest');
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
  return ProxyChatService();
});
