import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../domain/models/chat_message.dart';
import '../../domain/services/chat_service.dart';
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
      errorMessage: errorMessage, // We want to be able to nullify it
    );
  }
}

class ChatNotifier extends Notifier<ChatState> {
  @override
  ChatState build() {
    _checkApiKey();
    return const ChatState(
      messages: [
        // Hardcoded initial greeting
      ],
    );
  }

  Future<void> _checkApiKey() async {
    final service = ref.read(chatServiceProvider);
    final hasKey = await service.hasApiKey();
    
    // If they have a key, we add Morgana's greeting
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

    // 2. Fetch Context
    final dashboardState = ref.read(dashboardProvider);
    final xpCalculator = ref.read(xpCalculatorProvider);
    final questsState = ref.read(questsProvider);
    final service = ref.read(chatServiceProvider);

    // 3. Convert our Message history into Gemini's Content history
    final history = state.messages
        .where((m) => m != userMsg) // Don't include the one we just sent in history
        .map((m) => m.role == MessageRole.user 
            ? Content.text(m.text) 
            : Content.model([TextPart(m.text)]))
        .toList();

    try {
      // 4. Send to Gemini
      final responseText = await service.sendMessage(
        text,
        history,
        dashboardState.stats,
        xpCalculator,
        questsState.weather,
        questsState.activeQuests,
      );

      // 5. Add Morgana's response to UI
      final morganaMsg = ChatMessage(text: responseText, role: MessageRole.morgana);
      state = state.copyWith(
        messages: [...state.messages, morganaMsg],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to communicate with Morgana. Is your API key valid?',
      );
    }
  }
}

final chatProvider = NotifierProvider<ChatNotifier, ChatState>(() {
  return ChatNotifier();
});
