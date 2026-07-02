import 'package:flutter/material.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../domain/models/quest_model.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../dashboard/domain/models/user_stats.dart'; // for getRankLabel? wait we need to pass rank label

class QuestCard extends StatelessWidget {
  final Quest quest;
  final int currentXpForStat;
  final VoidCallback onComplete;
  final IXpCalculator xpCalculator;

  const QuestCard({
    super.key,
    required this.quest,
    required this.currentXpForStat,
    required this.onComplete,
    required this.xpCalculator,
  });

  @override
  Widget build(BuildContext context) {
    final statName = quest.targetStat.name.toUpperCase();
    final progress = xpCalculator.calculateProgress(currentXpForStat);
    final currentRank = xpCalculator.calculateRank(currentXpForStat);
    // Dummy UserStats to get rank label
    final rankLabel = const UserStats().getRankLabel(quest.targetStat.name, currentRank).toUpperCase();
    
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: ClipPath(
        clipper: P5JaggedClipper(jagRight: true, jagDepth: 6.0),
        child: Container(
          color: quest.isCompleted ? AppColors.surfaceDark : AppColors.primaryWhite,
          child: Row(
            children: [
              // Left color bar
              Container(
                width: 12,
                height: 100,
                color: quest.isCompleted ? AppColors.surfaceDark : AppColors.primaryRed,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              quest.title.toUpperCase(),
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: quest.isCompleted ? AppColors.primaryWhite.withOpacity(0.5) : AppColors.backgroundDark,
                                fontWeight: FontWeight.bold,
                                decoration: quest.isCompleted ? TextDecoration.lineThrough : null,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            color: AppColors.primaryRed,
                            child: Text(
                              '+$statName',
                              style: const TextStyle(
                                color: AppColors.primaryWhite,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Progress Bar
                      Row(
                        children: [
                          Text(
                            'RANK $currentRank: $rankLabel',
                            style: TextStyle(
                              color: quest.isCompleted ? AppColors.primaryWhite.withOpacity(0.5) : AppColors.backgroundDark,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ClipPath(
                              clipper: P5SlantedClipper(slant: 4.0),
                              child: LinearProgressIndicator(
                                value: progress,
                                backgroundColor: AppColors.surfaceDark.withOpacity(0.2),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  quest.isCompleted ? AppColors.surfaceDark : AppColors.primaryRed,
                                ),
                                minHeight: 12,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '+${quest.xpReward} XP',
                            style: TextStyle(
                              color: quest.isCompleted ? AppColors.primaryWhite.withOpacity(0.5) : AppColors.primaryRed,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              // Checkbox / Complete Button
              InkWell(
                onTap: quest.isCompleted ? null : onComplete,
                child: Container(
                  width: 60,
                  height: 100,
                  color: quest.isCompleted ? AppColors.surfaceDark : AppColors.primaryRed,
                  child: Center(
                    child: Icon(
                      quest.isCompleted ? Icons.check_circle : Icons.circle_outlined,
                      color: AppColors.primaryWhite,
                      size: 32,
                    ),
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
