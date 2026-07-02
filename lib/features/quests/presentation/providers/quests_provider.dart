import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/quest_model.dart';
import '../../domain/repositories/quest_repository.dart';
import '../../domain/services/quest_generator_service.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';

class QuestsState {
  final List<Quest> activeQuests;
  final bool isLoading;

  const QuestsState({
    this.activeQuests = const [],
    this.isLoading = false,
  });

  QuestsState copyWith({
    List<Quest>? activeQuests,
    bool? isLoading,
  }) {
    return QuestsState(
      activeQuests: activeQuests ?? this.activeQuests,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class QuestsNotifier extends Notifier<QuestsState> {
  @override
  QuestsState build() {
    _loadOrCreateQuests();
    return const QuestsState(isLoading: true);
  }

  Future<void> _loadOrCreateQuests() async {
    final repo = ref.read(questRepositoryProvider);
    var quests = await repo.getActiveQuests();

    // If no quests exist (e.g. new day), generate them!
    if (quests.isEmpty) {
      final dashboardState = ref.read(dashboardProvider);
      
      // Only generate if dashboard has loaded the user stats
      if (!dashboardState.isLoading) {
        final generator = ref.read(questGeneratorProvider);
        quests = generator.generateDailyQuests(dashboardState.stats);
        await repo.saveQuests(quests);
      }
    }

    state = state.copyWith(activeQuests: quests, isLoading: false);
  }

  Future<void> completeQuest(String questId) async {
    final repo = ref.read(questRepositoryProvider);
    final dashboard = ref.read(dashboardProvider.notifier);
    
    final quests = state.activeQuests.toList();
    final index = quests.indexWhere((q) => q.id == questId);
    
    if (index != -1 && !quests[index].isCompleted) {
      // 1. Mark as completed
      final completedQuest = quests[index].copyWith(isCompleted: true);
      quests[index] = completedQuest;
      
      // 2. Update state and repository
      state = state.copyWith(activeQuests: quests);
      await repo.saveQuest(completedQuest);
      
      // 3. Award XP!
      await dashboard.addXp(completedQuest.targetStat.name, completedQuest.xpReward);
    }
  }
}

final questsProvider = NotifierProvider<QuestsNotifier, QuestsState>(() {
  return QuestsNotifier();
});
