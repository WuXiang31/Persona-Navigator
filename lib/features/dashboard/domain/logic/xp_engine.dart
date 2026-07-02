/// Logic for converting total XP into a Rank (1 to 5)
class XpEngine {
  /// Defines the total accumulated XP required to REACH each rank.
  /// Rank 1 is the default starting point (requires 0 XP).
  static const Map<int, int> xpThresholds = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
  };

  /// Calculates the current rank based on total XP
  static int calculateRank(int totalXp) {
    if (totalXp >= xpThresholds[5]!) return 5;
    if (totalXp >= xpThresholds[4]!) return 4;
    if (totalXp >= xpThresholds[3]!) return 3;
    if (totalXp >= xpThresholds[2]!) return 2;
    return 1;
  }

  /// Returns the XP needed for the NEXT rank, or null if at max rank.
  static int? getNextRankThreshold(int currentRank) {
    if (currentRank >= 5) return null;
    return xpThresholds[currentRank + 1];
  }

  /// Returns the starting XP for the current rank
  static int getCurrentRankThreshold(int currentRank) {
    return xpThresholds[currentRank] ?? 0;
  }

  /// Calculates the progress percentage (0.0 to 1.0) towards the next rank
  static double calculateProgress(int totalXp) {
    final rank = calculateRank(totalXp);
    if (rank >= 5) return 1.0;

    final currentThreshold = getCurrentRankThreshold(rank);
    final nextThreshold = getNextRankThreshold(rank)!;
    
    final xpInCurrentRank = totalXp - currentThreshold;
    final xpRequiredForNextRank = nextThreshold - currentThreshold;

    return (xpInCurrentRank / xpRequiredForNextRank).clamp(0.0, 1.0);
  }
}
