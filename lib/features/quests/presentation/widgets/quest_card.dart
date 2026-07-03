import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/quest_model.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../../dashboard/domain/models/user_stats.dart';

class QuestCard extends StatelessWidget {
  final Quest quest;
  final int currentXpForStat;
  final VoidCallback onComplete;
  final VoidCallback? onTap;
  final IXpCalculator xpCalculator;
  final bool isSelectMode;
  final bool isSelected;
  final ValueChanged<bool?>? onSelectedChanged;

  const QuestCard({
    super.key,
    required this.quest,
    required this.currentXpForStat,
    required this.onComplete,
    this.onTap,
    required this.xpCalculator,
    this.isSelectMode = false,
    this.isSelected = false,
    this.onSelectedChanged,
  });

  @override
  Widget build(BuildContext context) {
    final statName = quest.targetStat.name.toUpperCase();
    final glyph = quest.targetStat.glyph;
    final progress = xpCalculator.calculateProgress(currentXpForStat);
    final currentRank = xpCalculator.calculateRank(currentXpForStat);
    final rankLabel = const UserStats().getRankLabel(quest.targetStat.name, currentRank).toUpperCase();
    
    // Check if it's a boosted quest (simplification for UI purposes right now)
    final isBoosted = quest.xpReward > 50; 
    
    return GestureDetector(
      onTap: isSelectMode
          ? () => onSelectedChanged?.call(!isSelected)
          : (quest.isCompleted ? null : onTap),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        child: Transform(
          transform: Matrix4.skewX(-0.14),
          child: Container(
            decoration: BoxDecoration(
              color: quest.isCompleted
                  ? AppColors.surfaceDark
                  : (isSelected ? AppColors.primaryRed.withOpacity(0.15) : AppColors.primaryWhite),
              border: Border(
                left: BorderSide(
                  color: isSelected 
                      ? AppColors.accentYellow 
                      : (quest.isCompleted ? AppColors.surfaceDark : (isBoosted ? AppColors.accentYellow : AppColors.primaryRed)),
                  width: 8,
                ),
              ),
            ),
            child: Row(
              children: [
                // Selection checkbox in select mode
                if (isSelectMode && !quest.isCompleted)
                  Transform(
                    transform: Matrix4.skewX(0.14),
                    child: Checkbox(
                      value: isSelected,
                      onChanged: onSelectedChanged,
                      activeColor: AppColors.primaryRed,
                      checkColor: AppColors.primaryWhite,
                    ),
                  ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Transform(
                      transform: Matrix4.skewX(0.14), // Unskew text content
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
                                    fontWeight: FontWeight.w900,
                                    fontStyle: FontStyle.italic,
                                    decoration: quest.isCompleted ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                color: isBoosted ? AppColors.accentYellow : AppColors.primaryRed,
                                child: Text(
                                  '$glyph $statName',
                                  style: TextStyle(
                                    color: isBoosted ? AppColors.backgroundDark : AppColors.primaryWhite,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 10,
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
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Transform(
                                  transform: Matrix4.skewX(-0.14),
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
                                '+${quest.xpReward} XP ${isBoosted ? '⚡' : ''}',
                                style: TextStyle(
                                  color: quest.isCompleted 
                                      ? AppColors.primaryWhite.withOpacity(0.5) 
                                      : (isBoosted ? AppColors.accentYellow : AppColors.primaryRed),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w900,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Checkbox / Complete Button (only in normal mode)
                if (!isSelectMode)
                  InkWell(
                    onTap: quest.isCompleted ? null : onComplete,
                    child: Transform(
                      transform: Matrix4.skewX(0.14), // Unskew icon
                      child: Container(
                        width: 60,
                        height: 100,
                        color: Colors.transparent,
                        child: Center(
                          child: Icon(
                            quest.isCompleted ? Icons.check_circle : Icons.circle_outlined,
                            color: quest.isCompleted ? AppColors.surfaceDark : AppColors.primaryRed,
                            size: 32,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
