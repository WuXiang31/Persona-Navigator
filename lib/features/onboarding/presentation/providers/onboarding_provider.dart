import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/user_profile.dart';
import '../../../dashboard/domain/repositories/user_repository.dart';
import '../../../dashboard/domain/models/user_stats.dart';

/// Notifier that manages the UserProfile during the onboarding flow.
/// 
/// Logic: We start with an empty UserProfile. As the user navigates through
/// the Velvet Room screens, we update the state. Once complete, this data
/// will be persisted to local storage (or a backend).
class OnboardingNotifier extends Notifier<UserProfile> {
  @override
  UserProfile build() {
    return const UserProfile();
  }

  /// Updates the user's role and triggers a state rebuild.
  void setRole(UserRole role) {
    state = state.copyWith(role: role);
  }

  /// Updates the user's age and triggers a state rebuild.
  void setAge(int age) {
    state = state.copyWith(age: age);
  }

  /// Adds or removes a goal from the user's list.
  /// Enforces a maximum of 3 goals.
  void toggleGoal(String goal) {
    final currentGoals = List<String>.from(state.goals);
    
    if (currentGoals.contains(goal)) {
      currentGoals.remove(goal);
    } else {
      if (currentGoals.length < 3) {
        currentGoals.add(goal);
      }
    }
    
    state = state.copyWith(goals: currentGoals);
  }

  /// Finalizes the onboarding process.
  /// (In a real app, this would save to SharedPreferences/Firestore)
  Future<void> completeOnboarding() async {
    if (!state.isComplete) return;
    
    final repo = ref.read(userRepositoryProvider);
    
    UserStats stats = UserStats(lastActiveDate: DateTime.now());
    if (state.role == UserRole.scholar) {
      stats = stats.copyWith(knowledgeXp: 50);
    } else if (state.role == UserRole.professional) {
      stats = stats.copyWith(proficiencyXp: 50);
    } else if (state.role == UserRole.creative) {
      stats = stats.copyWith(charmXp: 50);
    }

    await repo.saveUserProfile(state);
    await repo.saveUserStats(stats);
  }
}

/// The global provider for accessing the OnboardingNotifier state.
final onboardingProvider = NotifierProvider<OnboardingNotifier, UserProfile>(() {
  return OnboardingNotifier();
});
