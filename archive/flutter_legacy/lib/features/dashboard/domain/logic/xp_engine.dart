import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract class IXpCalculator {
  int calculateRank(int totalXp);
  int? getNextRankThreshold(int currentRank);
  int getCurrentRankThreshold(int currentRank);
  double calculateProgress(int totalXp);
}

/// Logic for converting total XP into a Rank (1 to 5)
class PersonaXpCalculator implements IXpCalculator {
  /// Defines the total accumulated XP required to REACH each rank.
  static const Map<int, int> xpThresholds = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
  };

  @override
  int calculateRank(int totalXp) {
    if (totalXp >= xpThresholds[5]!) return 5;
    if (totalXp >= xpThresholds[4]!) return 4;
    if (totalXp >= xpThresholds[3]!) return 3;
    if (totalXp >= xpThresholds[2]!) return 2;
    return 1;
  }

  @override
  int? getNextRankThreshold(int currentRank) {
    if (currentRank >= 5) return null;
    return xpThresholds[currentRank + 1];
  }

  @override
  int getCurrentRankThreshold(int currentRank) {
    return xpThresholds[currentRank] ?? 0;
  }

  @override
  double calculateProgress(int totalXp) {
    final rank = calculateRank(totalXp);
    if (rank >= 5) return 1.0;

    final currentThreshold = getCurrentRankThreshold(rank);
    final nextThreshold = getNextRankThreshold(rank)!;
    
    final xpInCurrentRank = totalXp - currentThreshold;
    final xpRequiredForNextRank = nextThreshold - currentThreshold;

    return (xpInCurrentRank / xpRequiredForNextRank).clamp(0.0, 1.0);
  }
}

final xpCalculatorProvider = Provider<IXpCalculator>((ref) {
  return PersonaXpCalculator();
});
