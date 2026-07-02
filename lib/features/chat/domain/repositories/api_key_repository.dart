import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class IApiKeyRepository {
  Future<String?> getApiKey();
  Future<void> saveApiKey(String key);
  Future<void> clearApiKey();
}

class SharedPrefsApiKeyRepository implements IApiKeyRepository {
  static const _keyPref = 'gemini_api_key';

  @override
  Future<String?> getApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    final key = prefs.getString(_keyPref);
    return key?.trim(); // Trim whitespace to prevent auth errors
  }

  @override
  Future<void> saveApiKey(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyPref, key.trim()); // Trim on save too
  }

  @override
  Future<void> clearApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyPref);
  }
}

final apiKeyRepositoryProvider = Provider<IApiKeyRepository>((ref) {
  return SharedPrefsApiKeyRepository();
});
