import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_stats.dart';

/// Interface for accessing user data (Stats, Profile, etc.)
abstract class IUserRepository {
  Future<UserStats> getUserStats();
  Future<void> saveUserStats(UserStats stats);
}

/// A mock implementation of the repository for testing and MVP.
class MockUserRepository implements IUserRepository {
  UserStats _cachedStats = const UserStats(
    knowledgeXp: 1200, // Rank 5
    gutsXp: 750,       // Rank 4
    proficiencyXp: 450,// Rank 3
    kindnessXp: 200,   // Rank 2
    charmXp: 50,       // Rank 1
  );

  @override
  Future<UserStats> getUserStats() async {
    // Simulate network/db delay
    await Future.delayed(const Duration(milliseconds: 300));
    return _cachedStats;
  }

  @override
  Future<void> saveUserStats(UserStats stats) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _cachedStats = stats;
  }
}

// Provider for the repository
final userRepositoryProvider = Provider<IUserRepository>((ref) {
  return MockUserRepository();
});
