import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/user_stats.dart';

/// State of the Dashboard
class DashboardState {
  final UserStats stats;
  final String morganaMessage;

  const DashboardState({
    required this.stats,
    required this.morganaMessage,
  });

  DashboardState copyWith({
    UserStats? stats,
    String? morganaMessage,
  }) {
    return DashboardState(
      stats: stats ?? this.stats,
      morganaMessage: morganaMessage ?? this.morganaMessage,
    );
  }
}

/// Notifier that manages the Dashboard state (Stats and Morgana dialogue).
class DashboardNotifier extends Notifier<DashboardState> {
  @override
  DashboardState build() {
    // Initial dummy state for MVP
    return const DashboardState(
      stats: UserStats(
        knowledgeXp: 1200, // Rank 5
        gutsXp: 750,       // Rank 4
        proficiencyXp: 450,// Rank 3
        kindnessXp: 200,   // Rank 2
        charmXp: 50,       // Rank 1
      ),
      morganaMessage: "Looking sharp, Leader!\nYou've got a study session in 30 minutes.",
    );
  }

  void updateMorganaMessage(String message) {
    state = state.copyWith(morganaMessage: message);
  }
}

final dashboardProvider = NotifierProvider<DashboardNotifier, DashboardState>(() {
  return DashboardNotifier();
});
