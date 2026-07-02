import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../domain/models/chat_message.dart';
import '../providers/chat_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  void _sendMessage() {
    final text = _textController.text;
    if (text.trim().isNotEmpty) {
      ref.read(chatProvider.notifier).sendMessage(text);
      _textController.clear();
      // Scroll to bottom
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.only(top: 60.0, left: 16.0, right: 16.0, bottom: 8.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'COMPANION',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),

            // Main Content Area
            Expanded(
              child: !chatState.hasApiKey 
                ? _buildApiKeyPrompt() 
                : _buildChatList(chatState),
            ),

            // Input Area
            if (chatState.hasApiKey) _buildInputArea(chatState),
          ],
        ),
      ),
      floatingActionButton: chatState.hasApiKey 
          ? null 
          : FloatingActionButton(
              backgroundColor: AppColors.primaryWhite,
              child: const Icon(Icons.arrow_back, color: AppColors.backgroundDark),
              onPressed: () => Navigator.of(context).pop(),
            ),
    );
  }

  Widget _buildChatList(ChatState chatState) {
    return Column(
      children: [
        // Error banner
        if (chatState.errorMessage != null)
          Container(
            width: double.infinity,
            color: Colors.red.shade900,
            padding: const EdgeInsets.all(12),
            child: Text(
              chatState.errorMessage!,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: chatState.messages.length + (chatState.isLoading ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == chatState.messages.length && chatState.isLoading) {
                return const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: CircularProgressIndicator(color: AppColors.primaryRed),
                  ),
                );
              }

        final message = chatState.messages[index];
        final isUser = message.role == MessageRole.user;

        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            child: ClipPath(
              clipper: P5SlantedClipper(slant: 5.0),
              child: Container(
                color: isUser ? AppColors.primaryWhite : AppColors.primaryRed,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Text(
                  message.text,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: isUser ? AppColors.backgroundDark : AppColors.primaryWhite,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    ),
        ),
      ],
    );
  }

  Widget _buildInputArea(ChatState chatState) {
    return Container(
      color: AppColors.backgroundDark.withOpacity(0.9),
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).padding.bottom > 0 
            ? MediaQuery.of(context).padding.bottom 
            : 16, // Safe area for iOS
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.primaryWhite),
            onPressed: () => Navigator.of(context).pop(),
          ),
          Expanded(
            child: TextField(
              controller: _textController,
              style: const TextStyle(color: AppColors.primaryWhite, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: 'Talk to Morgana...',
                hintStyle: TextStyle(color: AppColors.primaryWhite.withOpacity(0.5)),
                filled: true,
                fillColor: Colors.black.withOpacity(0.5),
                border: const OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primaryRed, width: 2),
                ),
                enabledBorder: const OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primaryWhite, width: 2),
                ),
                focusedBorder: const OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primaryRed, width: 2),
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            color: AppColors.primaryRed,
            child: IconButton(
              icon: const Icon(Icons.send, color: AppColors.primaryWhite),
              onPressed: chatState.isLoading ? null : _sendMessage,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApiKeyPrompt() {
    final TextEditingController keyController = TextEditingController();
    
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.smart_toy, size: 64, color: AppColors.primaryRed),
          const SizedBox(height: 16),
          Text(
            'AWAKEN YOUR COMPANION',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.primaryWhite,
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'To chat with Morgana, you need a free Gemini API Key from Google AI Studio.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.primaryWhite,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          TextField(
            controller: keyController,
            style: const TextStyle(color: AppColors.backgroundDark, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'Paste Gemini API Key here',
              filled: true,
              fillColor: AppColors.primaryWhite,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(0)),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryRed,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
              onPressed: () {
                final key = keyController.text.trim();
                if (key.isNotEmpty) {
                  ref.read(chatProvider.notifier).saveApiKey(key);
                }
              },
              child: Text(
                'CONNECT',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.primaryWhite,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
