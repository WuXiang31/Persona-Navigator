import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/quest_model.dart';
import '../../domain/models/weather_condition.dart';
import '../../domain/repositories/quest_repository.dart';
import '../../domain/repositories/calendar_repository.dart';
import '../../domain/services/quest_generator_service.dart';
import '../../domain/services/weather_service.dart';
import '../../domain/models/calendar_event.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';

class QuestsState {
  final List<Quest> activeQuests;
  final WeatherCondition weather;
  final bool isLoading;

  const QuestsState({
    this.activeQuests = const [],
    this.weather = WeatherCondition.clear,
    this.isLoading = false,
  });

  QuestsState copyWith({
    List<Quest>? activeQuests,
    WeatherCondition? weather,
    bool? isLoading,
  }) {
    return QuestsState(
      activeQuests: activeQuests ?? this.activeQuests,
      weather: weather ?? this.weather,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class QuestsNotifier extends Notifier<QuestsState> {
  @override
  QuestsState build() {
    _loadData();
    return const QuestsState(isLoading: true);
  }

  Future<void> _loadData() async {
    final questRepo = ref.read(questRepositoryProvider);
    final weatherService = ref.read(weatherServiceProvider);
    final calendarRepo = ref.read(calendarRepositoryProvider);
    
    // Fetch weather, quests, and calendar concurrently
    final results = await Future.wait([
      questRepo.getActiveQuests(),
      weatherService.getLocalWeather(),
      calendarRepo.getTodayEvents(),
    ]);

    var quests = results[0] as List<Quest>;
    final weather = results[1] as WeatherCondition;
    final calendarEvents = results[2] as List<CalendarEvent>;

    // If no quests exist (e.g. new day), generate them!
    if (quests.isEmpty) {
      final dashboardState = ref.read(dashboardProvider);
      
      // Only generate if dashboard has loaded the user stats
      if (!dashboardState.isLoading) {
        final generator = ref.read(questGeneratorProvider);
        quests = generator.generateDailyQuests(dashboardState.stats, calendarEvents);
        await questRepo.saveQuests(quests);
      }
    }

    state = state.copyWith(activeQuests: quests, weather: weather, isLoading: false);
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
      
      // 3. Award XP! Check if we get a weather bonus.
      int finalXp = completedQuest.xpReward;
      
      // Weather Bonus Logic:
      // If the quest targets the stat that is currently boosted by weather, add 50% XP!
      bool getsBonus = false;
      if (state.weather == WeatherCondition.rainy && completedQuest.targetStat == StatType.knowledge) getsBonus = true;
      if (state.weather == WeatherCondition.cloudy && completedQuest.targetStat == StatType.proficiency) getsBonus = true;
      if (state.weather == WeatherCondition.snowy && completedQuest.targetStat == StatType.guts) getsBonus = true;
      if (state.weather == WeatherCondition.clear && completedQuest.targetStat == StatType.charm) getsBonus = true;
      if (state.weather == WeatherCondition.thunderstorm) getsBonus = true; // All get bonus
      
      if (getsBonus) {
        finalXp = (finalXp * 1.5).round();
      }

      await dashboard.addXp(completedQuest.targetStat.name, finalXp);
    }
  }
}

final questsProvider = NotifierProvider<QuestsNotifier, QuestsState>(() {
  return QuestsNotifier();
});
