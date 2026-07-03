import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/user_stats.dart';
import '../../domain/repositories/user_repository.dart';

/// State of the Dashboard
class DashboardState {
  final UserStats stats;
  final String morganaMessage;
  final bool isLoading;

  const DashboardState({
    required this.stats,
    required this.morganaMessage,
    this.isLoading = false,
  });

  DashboardState copyWith({
    UserStats? stats,
    String? morganaMessage,
    bool? isLoading,
  }) {
    return DashboardState(
      stats: stats ?? this.stats,
      morganaMessage: morganaMessage ?? this.morganaMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

/// Notifier that manages the Dashboard state (Stats and Morgana dialogue).
class DashboardNotifier extends Notifier<DashboardState> {
  @override
  DashboardState build() {
    // Initialize loading state
    _loadStats();

    return const DashboardState(
      stats: UserStats(), // Empty initially
      morganaMessage: "Waking up...",
      isLoading: true,
    );
  }

  Future<void> _loadStats() async {
    final repo = ref.read(userRepositoryProvider);
    final stats = await repo.getUserStats() ?? const UserStats();
    
    state = state.copyWith(
      stats: stats,
      morganaMessage: "Looking sharp, Leader!\nYou've got a study session in 30 minutes.",
      isLoading: false,
    );
  }

  void updateMorganaMessage(String message) {
    state = state.copyWith(morganaMessage: message);
  }

  Future<void> addXp(String statName, int amount) async {
    final repo = ref.read(userRepositoryProvider);
    
    UserStats newStats;
    switch (statName.toLowerCase()) {
      case 'knowledge':
        newStats = state.stats.copyWith(knowledgeXp: state.stats.knowledgeXp + amount);
        break;
      case 'guts':
        newStats = state.stats.copyWith(gutsXp: state.stats.gutsXp + amount);
        break;
      case 'proficiency':
        newStats = state.stats.copyWith(proficiencyXp: state.stats.proficiencyXp + amount);
        break;
      case 'kindness':
        newStats = state.stats.copyWith(kindnessXp: state.stats.kindnessXp + amount);
        break;
      case 'charm':
        newStats = state.stats.copyWith(charmXp: state.stats.charmXp + amount);
        break;
      default:
        return;
    }

    state = state.copyWith(stats: newStats);
    await repo.saveUserStats(newStats);
  }
}

final dashboardProvider = NotifierProvider<DashboardNotifier, DashboardState>(() {
  return DashboardNotifier();
});
