import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/onboarding/domain/models/user_profile.dart';

void main() {
  group('UserProfile Serialization', () {
    test('toJson returns a valid map', () {
      const profile = UserProfile(
        role: UserRole.creative,
        age: 25,
        goals: ['Finish project', 'Learn Dart'],
      );

      final json = profile.toJson();

      expect(json, {
        'role': 'creative',
        'age': 25,
        'goals': ['Finish project', 'Learn Dart'],
      });
    });

    test('fromJson creates a valid object from map', () {
      final json = {
        'role': 'professional',
        'age': 30,
        'goals': ['Get promoted'],
      };

      final profile = UserProfile.fromJson(json);

      expect(profile.role, UserRole.professional);
      expect(profile.age, 30);
      expect(profile.goals, ['Get promoted']);
    });
    
    test('fromJson handles null values safely', () {
      final json = <String, dynamic>{};

      final profile = UserProfile.fromJson(json);

      expect(profile.role, null);
      expect(profile.age, null);
      expect(profile.goals, isEmpty);
    });
  });
}
