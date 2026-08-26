import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/dashboard/domain/logic/stat_decay_engine.dart';
import 'package:persona_navigator/features/dashboard/domain/models/user_stats.dart';

void main() {
  const engine = StatDecayEngine();

  group('StatDecayEngine Tests', () {
    test('applyDecay initializes lastActiveDate if null', () {
      const stats = UserStats(knowledgeXp: 50);
      final now = DateTime.now();

      final result = engine.applyDecay(stats, now);

      expect(result.knowledgeXp, 50);
      expect(result.lastActiveDate, now);
    });

    test('applyDecay applies no penalty if days missed is 0', () {
      final now = DateTime.now();
      final stats = UserStats(knowledgeXp: 100, lastActiveDate: now);

      final result = engine.applyDecay(stats, now);

      expect(result.knowledgeXp, 100);
      expect(result.lastActiveDate, now);
    });

    test('applyDecay applies 10 XP penalty for 1 day missed', () {
      final now = DateTime.now();
      final yesterday = now.subtract(const Duration(days: 1));
      final stats = UserStats(
        knowledgeXp: 100,
        gutsXp: 100,
        proficiencyXp: 100,
        kindnessXp: 100,
        charmXp: 100,
        lastActiveDate: yesterday,
      );

      final result = engine.applyDecay(stats, now);

      expect(result.knowledgeXp, 90);
      expect(result.gutsXp, 90);
      expect(result.proficiencyXp, 90);
      expect(result.kindnessXp, 90);
      expect(result.charmXp, 90);
      expect(result.lastActiveDate, now);
    });

    test('applyDecay applies 50 XP penalty for 5 days missed', () {
      final now = DateTime.now();
      final fiveDaysAgo = now.subtract(const Duration(days: 5));
      final stats = UserStats(knowledgeXp: 100, lastActiveDate: fiveDaysAgo);

      final result = engine.applyDecay(stats, now);

      expect(result.knowledgeXp, 50);
      expect(result.lastActiveDate, now);
    });

    test('applyDecay bounds XP penalty at 0 (does not go negative)', () {
      final now = DateTime.now();
      final fiveDaysAgo = now.subtract(const Duration(days: 5));
      final stats = UserStats(knowledgeXp: 20, lastActiveDate: fiveDaysAgo);

      final result = engine.applyDecay(stats, now);

      // Penalty is 50, but XP was 20, so it should bottom out at 0.
      expect(result.knowledgeXp, 0);
      expect(result.lastActiveDate, now);
    });
  });
}
