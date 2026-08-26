import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'user_repository.dart';
import '../models/user_stats.dart';
import '../../../../features/onboarding/domain/models/user_profile.dart';

class LocalUserRepository implements IUserRepository {
  static const _statsKey = 'user_stats';
  static const _profileKey = 'user_profile';

  @override
  Future<UserStats?> getUserStats() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_statsKey);
    if (data != null) {
      return UserStats.fromJson(jsonDecode(data));
    }
    return null;
  }

  @override
  Future<void> saveUserStats(UserStats stats) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_statsKey, jsonEncode(stats.toJson()));
  }

  @override
  Future<UserProfile?> getUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_profileKey);
    if (data != null) {
      return UserProfile.fromJson(jsonDecode(data));
    }
    return null;
  }

  @override
  Future<void> saveUserProfile(UserProfile profile) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_profileKey, jsonEncode(profile.toJson()));
  }
}
