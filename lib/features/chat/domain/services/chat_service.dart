import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../quests/domain/models/weather_condition.dart';
import '../../../quests/domain/models/quest_model.dart';
import '../repositories/api_key_repository.dart';

abstract class IChatService {
  Future<String> sendMessage(
    String message, 
    List<Content> history,
    UserStats stats,
    IXpCalculator xpCalculator,
    WeatherCondition weather,
    List<Quest> activeQuests,
  );
  Future<bool> hasApiKey();
  Future<void> saveApiKey(String key);
}

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
    List<Content> history,
    UserStats stats,
    IXpCalculator xpCalculator,
    WeatherCondition weather,
    List<Quest> activeQuests,
  ) async {
    final apiKey = await _apiKeyRepo.getApiKey();
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception('API Key not found');
    }

    // Build the dynamic system prompt with the user's current context
    final systemPrompt = _buildSystemPrompt(stats, xpCalculator, weather, activeQuests);

    final model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
      systemInstruction: Content.system(systemPrompt),
    );

    final chatSession = model.startChat(history: history);
    
    final response = await chatSession.sendMessage(Content.text(message));
    return response.text ?? '...';
  }

  String _buildSystemPrompt(UserStats stats, IXpCalculator xpCalculator, WeatherCondition weather, List<Quest> quests) {
    final questDescriptions = quests.map((q) => '- ${q.title} (Reward: ${q.xpReward} XP for ${q.targetStat.name})').join('\n');
    
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

final chatServiceProvider = Provider<IChatService>((ref) {
  final repo = ref.read(apiKeyRepositoryProvider);
  return GeminiChatService(repo);
});
