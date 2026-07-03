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
import '../../../chat/domain/services/chat_service.dart';

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
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'back_btn',
            backgroundColor: AppColors.primaryWhite,
            child: const Icon(Icons.arrow_back, color: AppColors.backgroundDark),
            onPressed: () => Navigator.of(context).pop(),
          ),
          const SizedBox(width: 16),
          FloatingActionButton(
            heroTag: 'add_quest_btn',
            backgroundColor: AppColors.primaryRed,
            child: const Icon(Icons.add, color: AppColors.primaryWhite),
            onPressed: () => _showAddQuestDialog(context, ref),
          ),
        ],
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

  void _showAddQuestDialog(BuildContext context, WidgetRef ref) {
    String title = '';
    StatType selectedStat = StatType.knowledge;
    TimeSlot selectedTimeSlot = TimeSlot.morning;
    bool isAutoMode = true; // Auto mode by default
    double xpValue = 50; // default for manual mode
    bool isLoadingAuto = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              backgroundColor: Colors.transparent,
              child: ClipPath(
                clipper: P5SlantedClipper(),
                child: Container(
                  color: AppColors.backgroundDark,
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'NEW MISSION',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.primaryRed,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SegmentedButton<bool>(
                        segments: const [
                          ButtonSegment(value: true, label: Text('Auto-Decide')),
                          ButtonSegment(value: false, label: Text('Manual')),
                        ],
                        selected: {isAutoMode},
                        onSelectionChanged: (Set<bool> newSelection) {
                          setState(() {
                            isAutoMode = newSelection.first;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        style: const TextStyle(color: AppColors.primaryWhite),
                        decoration: const InputDecoration(
                          labelText: 'Mission Title',
                          labelStyle: TextStyle(color: Colors.grey),
                          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                          focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed, width: 2)),
                        ),
                        onChanged: (value) => title = value,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<TimeSlot>(
                        value: selectedTimeSlot,
                        dropdownColor: AppColors.backgroundDark,
                        style: const TextStyle(color: AppColors.primaryWhite),
                        decoration: const InputDecoration(
                          labelText: 'Time of Day',
                          labelStyle: TextStyle(color: Colors.grey),
                          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                        ),
                        items: TimeSlot.values.map((slot) {
                          return DropdownMenuItem(
                            value: slot,
                            child: Text(slot.name.toUpperCase()),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) setState(() => selectedTimeSlot = value);
                        },
                      ),
                      if (!isAutoMode) ...[
                        const SizedBox(height: 16),
                        DropdownButtonFormField<StatType>(
                          value: selectedStat,
                          dropdownColor: AppColors.backgroundDark,
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Target Stat',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                          ),
                          items: StatType.values.map((stat) {
                            return DropdownMenuItem(
                              value: stat,
                              child: Text(stat.name.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) setState(() => selectedStat = value);
                          },
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Text('XP Reward:', style: TextStyle(color: Colors.grey)),
                            Expanded(
                              child: Slider(
                                value: xpValue,
                                min: 10,
                                max: 100,
                                divisions: 90,
                                activeColor: AppColors.primaryRed,
                                inactiveColor: Colors.grey,
                                label: xpValue.round().toString(),
                                onChanged: (val) {
                                  setState(() {
                                    xpValue = val;
                                  });
                                },
                              ),
                            ),
                            Text('${xpValue.round()}', style: const TextStyle(color: AppColors.primaryWhite)),
                          ],
                        ),
                      ],
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
                          ),
                          const SizedBox(width: 8),
                          if (isLoadingAuto)
                            const CircularProgressIndicator(color: AppColors.primaryRed)
                          else
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryRed,
                                foregroundColor: AppColors.primaryWhite,
                                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                              ),
                              onPressed: () async {
                                if (title.isEmpty) return;
                                
                                if (isAutoMode) {
                                  setState(() => isLoadingAuto = true);
                                  try {
                                    final chatService = ref.read(chatServiceProvider);
                                    final (stat, xp) = await chatService.autoDecideQuest(title);
                                    
                                    if (context.mounted) {
                                      ref.read(questsProvider.notifier).addCustomQuest(
                                        title, stat, selectedTimeSlot, xpReward: xp,
                                      );
                                      Navigator.of(context).pop();
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Error: $e')),
                                      );
                                      setState(() => isLoadingAuto = false);
                                    }
                                  }
                                } else {
                                  ref.read(questsProvider.notifier).addCustomQuest(
                                    title, selectedStat, selectedTimeSlot, xpReward: xpValue.round(),
                                  );
                                  Navigator.of(context).pop();
                                }
                              },
                              child: Text(isAutoMode ? 'AUTO-DECIDE & SAVE' : 'SAVE MISSION', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
