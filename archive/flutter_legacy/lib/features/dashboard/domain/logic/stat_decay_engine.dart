import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_stats.dart';

/// Provider for the [StatDecayEngine]
final statDecayEngineProvider = Provider<StatDecayEngine>((ref) {
  return const StatDecayEngine();
});

/// Engine responsible for calculating and applying stat decay
/// when the user neglects self-improvement.
class StatDecayEngine {
  const StatDecayEngine();

  /// Applies decay to the user's stats based on days missed.
  /// Deducts 10 XP per day missed.
  UserStats applyDecay(UserStats currentStats, DateTime now) {
    if (currentStats.lastActiveDate == null) {
      // First time using this system, just initialize the last active date
      return currentStats.copyWith(lastActiveDate: now);
    }

    final daysMissed = now.difference(currentStats.lastActiveDate!).inDays;
    
    if (daysMissed > 0) {
      final penalty = daysMissed * 10;
      return currentStats.copyWith(
        knowledgeXp: max(0, currentStats.knowledgeXp - penalty),
        gutsXp: max(0, currentStats.gutsXp - penalty),
        proficiencyXp: max(0, currentStats.proficiencyXp - penalty),
        kindnessXp: max(0, currentStats.kindnessXp - penalty),
        charmXp: max(0, currentStats.charmXp - penalty),
        lastActiveDate: now,
      );
    }

    return currentStats.copyWith(lastActiveDate: now);
  }
}
