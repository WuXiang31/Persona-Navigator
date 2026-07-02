import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/quests/domain/services/quest_generator_service.dart';
import 'package:persona_navigator/features/dashboard/domain/models/user_stats.dart';
import 'package:persona_navigator/features/quests/domain/models/quest_model.dart';

void main() {
  group('PersonaQuestGenerator', () {
    late PersonaQuestGenerator generator;

    setUp(() {
      generator = PersonaQuestGenerator();
    });

    test('Generates requested number of quests', () {
      final stats = const UserStats();
      final quests = generator.generateDailyQuests(stats, count: 2);
      expect(quests.length, 2);
    });

    test('Targets the lowest stats first', () {
      // Set Knowledge and Charm to 0, everything else higher
      final stats = const UserStats(
        knowledgeXp: 0,
        charmXp: 0,
        gutsXp: 100,
        proficiencyXp: 200,
        kindnessXp: 300,
      );

      final quests = generator.generateDailyQuests(stats, count: 2);

      expect(quests.length, 2);
      
      // We expect the quests to target Knowledge and Charm
      final targetedStats = quests.map((q) => q.targetStat).toList();
      expect(targetedStats.contains(StatType.knowledge), true);
      expect(targetedStats.contains(StatType.charm), true);
    });
  });
}
