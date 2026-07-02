import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../domain/models/quest_model.dart';
import '../../domain/models/weather_condition.dart';
import '../widgets/quest_card.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../providers/quests_provider.dart';

class MissionsScreen extends ConsumerWidget {
  const MissionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardProvider);
    final questsState = ref.watch(questsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            // Top Bar / Weather Banner
            _buildWeatherBanner(context, questsState),
            
            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'MISSIONS',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            
            // Quest List
            Expanded(
              child: questsState.isLoading 
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryRed))
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 100),
                    itemCount: questsState.activeQuests.length,
                    itemBuilder: (context, index) {
                      final quest = questsState.activeQuests[index];
                      // Find current XP for this stat
                      int currentXp = 0;
                      switch (quest.targetStat) {
                        case StatType.knowledge:
                          currentXp = dashboardState.stats.knowledgeXp;
                          break;
                        case StatType.guts:
                          currentXp = dashboardState.stats.gutsXp;
                          break;
                        case StatType.proficiency:
                          currentXp = dashboardState.stats.proficiencyXp;
                          break;
                        case StatType.kindness:
                          currentXp = dashboardState.stats.kindnessXp;
                          break;
                        case StatType.charm:
                          currentXp = dashboardState.stats.charmXp;
                          break;
                      }

                      return QuestCard(
                        quest: quest,
                        currentXpForStat: currentXp,
                        xpCalculator: ref.watch(xpCalculatorProvider),
                        onComplete: () {
                          ref.read(questsProvider.notifier).completeQuest(quest.id);
                        },
                      );
                    },
                  ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primaryWhite,
        child: const Icon(Icons.arrow_back, color: AppColors.backgroundDark),
        onPressed: () => Navigator.of(context).pop(),
      ),
    );
  }

  Widget _buildWeatherBanner(BuildContext context, QuestsState state) {
    // Determine banner color based on weather
    Color bannerColor;
    if (state.weather == WeatherCondition.clear) bannerColor = AppColors.primaryRed;
    else if (state.weather == WeatherCondition.thunderstorm) bannerColor = Colors.deepPurple;
    else if (state.weather == WeatherCondition.snowy) bannerColor = Colors.lightBlue;
    else bannerColor = AppColors.primaryWhite.withOpacity(0.9);

    final textColor = (bannerColor == AppColors.primaryRed || bannerColor == Colors.deepPurple) 
        ? AppColors.primaryWhite 
        : AppColors.backgroundDark;

    return Padding(
      padding: const EdgeInsets.only(top: 60.0, left: 16, right: 16),
      child: ClipPath(
        clipper: P5SlantedClipper(slant: 8.0),
        child: Container(
          width: double.infinity,
          color: bannerColor,
          padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 24.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                state.isLoading ? 'FETCHING WEATHER...' : 'CONDITION ${state.weather.displayName}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                ),
              ),
              if (!state.isLoading)
                Text(
                  state.weather.statBonusDisplay,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
