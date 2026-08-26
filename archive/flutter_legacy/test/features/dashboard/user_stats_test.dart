import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/dashboard/domain/models/user_stats.dart';

void main() {
  group('UserStats Serialization', () {
    test('toJson returns a valid map', () {
      const stats = UserStats(
        knowledgeXp: 10,
        gutsXp: 20,
        proficiencyXp: 30,
        kindnessXp: 40,
        charmXp: 50,
      );

      final json = stats.toJson();

      expect(json, {
        'knowledgeXp': 10,
        'gutsXp': 20,
        'proficiencyXp': 30,
        'kindnessXp': 40,
        'charmXp': 50,
      });
    });

    test('fromJson creates a valid object from map', () {
      final json = {
        'knowledgeXp': 10,
        'gutsXp': 20,
        'proficiencyXp': 30,
        'kindnessXp': 40,
        'charmXp': 50,
      };

      final stats = UserStats.fromJson(json);

      expect(stats.knowledgeXp, 10);
      expect(stats.gutsXp, 20);
      expect(stats.proficiencyXp, 30);
      expect(stats.kindnessXp, 40);
      expect(stats.charmXp, 50);
    });

    test('fromJson handles missing keys with defaults', () {
      final json = <String, dynamic>{};

      final stats = UserStats.fromJson(json);

      expect(stats.knowledgeXp, 0);
      expect(stats.gutsXp, 0);
      expect(stats.proficiencyXp, 0);
      expect(stats.kindnessXp, 0);
      expect(stats.charmXp, 0);
    });
  });
}
