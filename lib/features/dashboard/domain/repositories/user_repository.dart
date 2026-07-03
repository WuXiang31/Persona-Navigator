import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_stats.dart';
import '../../../../features/onboarding/domain/models/user_profile.dart';
import 'local_user_repository.dart';

/// Interface for accessing user data (Stats, Profile, etc.)
abstract class IUserRepository {
  Future<UserStats?> getUserStats();
  Future<void> saveUserStats(UserStats stats);
  Future<UserProfile?> getUserProfile();
  Future<void> saveUserProfile(UserProfile profile);
}

// Provider for the repository
final userRepositoryProvider = Provider<IUserRepository>((ref) {
  return LocalUserRepository();
});

