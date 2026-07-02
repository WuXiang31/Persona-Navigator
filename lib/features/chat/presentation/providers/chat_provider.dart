import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/chat_message.dart';
import '../../domain/services/chat_service.dart';
import '../../domain/repositories/api_key_repository.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';
import '../../../quests/presentation/providers/quests_provider.dart';

class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final bool hasApiKey;
  final String? errorMessage;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.hasApiKey = false,
    this.errorMessage,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? hasApiKey,
    String? errorMessage,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      hasApiKey: hasApiKey ?? this.hasApiKey,
      errorMessage: errorMessage, // Intentionally nullable to allow clearing
    );
  }
}

class ChatNotifier extends Notifier<ChatState> {
  @override
  ChatState build() {
    _checkApiKey();
    return const ChatState();
  }

  Future<void> _checkApiKey() async {
    final service = ref.read(chatServiceProvider);
    final hasKey = await service.hasApiKey();
    
    // Validate key length - if it's corrupted/truncated, clear it
    if (hasKey) {
      final repo = ref.read(apiKeyRepositoryProvider);
      final key = await repo.getApiKey();
      if (key != null && key.length < 10) {
        debugPrint('[Morgana] Stored key is corrupted (${key.length} chars). Clearing.');
        await repo.clearApiKey();
        state = state.copyWith(hasApiKey: false, messages: []);
        return;
      }
    }

    // If they have a valid key, add Morgana's greeting
    List<ChatMessage> initialMessages = [];
    if (hasKey) {
      initialMessages.add(
        ChatMessage(
          text: "Looking cool! I'm Morgana. What should we do today?",
          role: MessageRole.morgana,
        ),
      );
    }

    state = state.copyWith(hasApiKey: hasKey, messages: initialMessages);
  }

  Future<void> saveApiKey(String key) async {
    final service = ref.read(chatServiceProvider);
    await service.saveApiKey(key);
    await _checkApiKey();
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    // 1. Add user message to UI
    final userMsg = ChatMessage(text: text, role: MessageRole.user);
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isLoading: true,
      errorMessage: null,
    );

    // 2. Fetch Context from other providers
    final dashboardState = ref.read(dashboardProvider);
    final xpCalculator = ref.read(xpCalculatorProvider);
    final questsState = ref.read(questsProvider);
    final service = ref.read(chatServiceProvider);

    // 3. Build conversation history as simple Maps for the REST API.
    // We skip the hardcoded greeting (index 0) and the message we just added,
    // because the REST API expects history to alternate user/model.
    final history = <Map<String, dynamic>>[];
    for (final m in state.messages) {
      if (m == userMsg) continue; // Skip current message (sent separately)
      if (state.messages.indexOf(m) == 0 && m.role == MessageRole.morgana) continue; // Skip greeting
      
      history.add({
        'role': m.role == MessageRole.user ? 'user' : 'model',
        'parts': [{'text': m.text}],
      });
    }

    debugPrint('[Morgana] Sending message: "$text"');
    debugPrint('[Morgana] History length: ${history.length}');

    try {
      // 4. Send to Gemini REST API
      final responseText = await service.sendMessage(
        text,
        history,
        dashboardState.stats,
        xpCalculator,
        questsState.weather,
        questsState.activeQuests,
      );

      debugPrint('[Morgana] Response received: "$responseText"');

      // 5. Add Morgana's response to UI
      final morganaMsg = ChatMessage(text: responseText, role: MessageRole.morgana);
      state = state.copyWith(
        messages: [...state.messages, morganaMsg],
        isLoading: false,
      );
    } catch (e, stackTrace) {
      debugPrint('[Morgana] ERROR: $e');
      debugPrint('[Morgana] Stack: $stackTrace');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to reach Morgana: ${e.toString()}',
      );
    }
  }
}

final chatProvider = NotifierProvider<ChatNotifier, ChatState>(() {
  return ChatNotifier();
});
