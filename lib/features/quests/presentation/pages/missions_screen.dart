import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../domain/models/quest_model.dart';
import '../widgets/quest_card.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';

class MissionsScreen extends ConsumerStatefulWidget {
  const MissionsScreen({super.key});

  @override
  ConsumerState<MissionsScreen> createState() => _MissionsScreenState();
}

class _MissionsScreenState extends ConsumerState<MissionsScreen> {
  // Dummy Quests for MVP
  List<Quest> activeQuests = [
    const Quest(
      id: 'q1',
      title: 'Study at the Diner',
      targetStat: StatType.knowledge,
      xpReward: 50,
      timeSlot: TimeSlot.afternoon,
    ),
    const Quest(
      id: 'q2',
      title: 'Intense Gym Session',
      targetStat: StatType.guts,
      xpReward: 75,
      timeSlot: TimeSlot.evening,
    ),
    const Quest(
      id: 'q3',
      title: 'Help a Friend Move',
      targetStat: StatType.kindness,
      xpReward: 100,
      timeSlot: TimeSlot.morning,
    ),
  ];

  void _completeQuest(int index) {
    setState(() {
      activeQuests[index] = activeQuests[index].copyWith(isCompleted: true);
    });
    // In a real app, this would dispatch an event to the DashboardNotifier to increase XP
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            // Top Bar / Weather Banner
            _buildWeatherBanner(context),
            
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
              child: ListView.builder(
                padding: const EdgeInsets.only(bottom: 100),
                itemCount: activeQuests.length,
                itemBuilder: (context, index) {
                  final quest = activeQuests[index];
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
                    onComplete: () => _completeQuest(index),
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

  Widget _buildWeatherBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 20, left: 16, right: 16),
      child: ClipPath(
        clipper: P5SlantedClipper(slant: 10.0),
        child: Container(
          color: AppColors.primaryRed,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.water_drop, color: AppColors.primaryWhite, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'CONDITION RAINY',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.primaryWhite,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                color: AppColors.backgroundDark,
                child: Text(
                  'BONUS: KNOWLEDGE+',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
