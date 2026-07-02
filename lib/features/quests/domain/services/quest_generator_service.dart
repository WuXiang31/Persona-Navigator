import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../models/quest_model.dart';
import '../../../dashboard/domain/models/user_stats.dart';

abstract class IQuestGeneratorService {
  /// Generates a list of recommended daily quests based on the user's current stats.
  List<Quest> generateDailyQuests(UserStats stats, {int count = 2});
}

class PersonaQuestGenerator implements IQuestGeneratorService {
  final _uuid = const Uuid();

  @override
  List<Quest> generateDailyQuests(UserStats stats, {int count = 2}) {
    // 1. Find the lowest stats to target for improvement
    final statMap = {
      StatType.knowledge: stats.knowledgeXp,
      StatType.guts: stats.gutsXp,
      StatType.proficiency: stats.proficiencyXp,
      StatType.kindness: stats.kindnessXp,
      StatType.charm: stats.charmXp,
    };

    // Sort by XP (ascending)
    final sortedStats = statMap.entries.toList()
      ..sort((a, b) => a.value.compareTo(b.value));

    final generatedQuests = <Quest>[];
    
    // 2. Generate quests for the lowest stats
    for (int i = 0; i < count && i < sortedStats.length; i++) {
      final targetStat = sortedStats[i].key;
      generatedQuests.add(_createQuestForStat(targetStat));
    }

    return generatedQuests;
  }

  Quest _createQuestForStat(StatType stat) {
    String title;
    TimeSlot slot;
    
    // Mocked quest titles based on stat
    switch (stat) {
      case StatType.knowledge:
        title = 'Study at the Diner';
        slot = TimeSlot.afternoon;
        break;
      case StatType.guts:
        title = 'Take the Big Bang Challenge';
        slot = TimeSlot.evening;
        break;
      case StatType.proficiency:
        title = 'Craft Infiltration Tools';
        slot = TimeSlot.night;
        break;
      case StatType.kindness:
        title = 'Tend to the Plant';
        slot = TimeSlot.morning;
        break;
      case StatType.charm:
        title = 'Work at the Convenience Store';
        slot = TimeSlot.afternoon;
        break;
    }

    return Quest(
      id: _uuid.v4(),
      title: title,
      targetStat: stat,
      xpReward: 50,
      timeSlot: slot,
    );
  }
}

final questGeneratorProvider = Provider<IQuestGeneratorService>((ref) {
  return PersonaQuestGenerator();
});
