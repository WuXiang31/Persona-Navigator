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
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Transform(
              transform: Matrix4.skewX(-0.14),
              child: Container(
                decoration: BoxDecoration(
                  color: quest.isCompleted
                      ? AppColors.backgroundDark // Very dark when complete
                      : (isSelected ? AppColors.primaryRed.withOpacity(0.15) : AppColors.surfaceDark),
                  border: Border(
                    left: BorderSide(
                      color: isSelected 
                          ? AppColors.accentYellow 
                          : (quest.isCompleted ? AppColors.backgroundDark : (isBoosted ? AppColors.accentYellow : AppColors.primaryRed)),
                      width: 8,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    // Checkbox / Complete Button (only in normal mode)
                    if (!isSelectMode)
                      InkWell(
                        onTap: quest.isCompleted ? null : onComplete,
                        child: Transform(
                          transform: Matrix4.skewX(0.14), // Unskew icon
                          child: Container(
                            width: 60,
                            height: 80,
                            color: Colors.transparent,
                            alignment: Alignment.topCenter,
                            padding: const EdgeInsets.only(top: 16),
                            child: quest.isCompleted 
                              ? Container(
                                  width: 28,
                                  height: 28,
                                  color: AppColors.primaryRed,
                                  child: const Icon(Icons.check, color: AppColors.primaryWhite, size: 20),
                                )
                              : Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.primaryWhite, width: 2),
                                  ),
                                ),
                          ),
                        ),
                      ),
                    // Selection checkbox in select mode
                    if (isSelectMode && !quest.isCompleted)
                      Transform(
                        transform: Matrix4.skewX(0.14),
                        child: Container(
                          width: 60,
                          alignment: Alignment.center,
                          child: Checkbox(
                            value: isSelected,
                            onChanged: onSelectedChanged,
                            activeColor: AppColors.primaryRed,
                            checkColor: AppColors.primaryWhite,
                          ),
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
                                        color: quest.isCompleted ? AppColors.primaryWhite.withOpacity(0.3) : AppColors.primaryWhite,
                                        fontWeight: FontWeight.w900,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              // Progress Bar or Earned Text
                              Row(
                                children: [
                                  Text(
                                    '$glyph  $statName',
                                    style: TextStyle(
                                      color: quest.isCompleted ? AppColors.primaryWhite.withOpacity(0.3) : AppColors.primaryWhite,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  const Spacer(),
                                  if (quest.isCompleted)
                                    Text(
                                      'EARNED +${quest.xpReward} XP',
                                      style: const TextStyle(
                                        color: AppColors.accentYellow,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    )
                                  else
                                    Text(
                                      '+${quest.xpReward} XP ${isBoosted ? '⚡' : ''}',
                                      style: TextStyle(
                                        color: isBoosted ? AppColors.accentYellow : AppColors.primaryWhite,
                                        fontSize: 14,
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
                  ],
                ),
              ),
            ),
            // The COMPLETE Stamp Overlaid
            if (quest.isCompleted)
              Positioned(
                top: 0,
                right: 20,
                child: Transform.rotate(
                  angle: -0.15, // Approx -8 degrees
                  child: Container(
                    color: AppColors.primaryRed,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: const Text(
                      'COMPLETE',
                      style: TextStyle(
                        color: AppColors.primaryWhite,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        fontSize: 18,
                        letterSpacing: 2.0,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
