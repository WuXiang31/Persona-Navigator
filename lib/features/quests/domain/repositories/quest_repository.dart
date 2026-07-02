import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/quest_model.dart';

/// Interface for accessing quest data.
abstract class IQuestRepository {
  Future<List<Quest>> getActiveQuests();
  Future<void> saveQuest(Quest quest);
  Future<void> saveQuests(List<Quest> quests);
}

/// Mock implementation of quest repository for MVP.
class MockQuestRepository implements IQuestRepository {
  final List<Quest> _activeQuests = [
    const Quest(
      id: 'q1',
      title: 'Study at the Diner',
      targetStat: StatType.knowledge,
      xpReward: 50,
      timeSlot: TimeSlot.afternoon,
    ),
    const Quest(
      id: 'q2',
      title: 'Intense Gym Session',
      targetStat: StatType.guts,
      xpReward: 75,
      timeSlot: TimeSlot.evening,
    ),
  ];

  @override
  Future<List<Quest>> getActiveQuests() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _activeQuests;
  }

  @override
  Future<void> saveQuest(Quest quest) async {
    final index = _activeQuests.indexWhere((q) => q.id == quest.id);
    if (index != -1) {
      _activeQuests[index] = quest;
    } else {
      _activeQuests.add(quest);
    }
  }

  @override
  Future<void> saveQuests(List<Quest> quests) async {
    for (var quest in quests) {
      await saveQuest(quest);
    }
  }
}

final questRepositoryProvider = Provider<IQuestRepository>((ref) {
  return MockQuestRepository();
});
