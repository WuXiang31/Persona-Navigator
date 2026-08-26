import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/squad_member.dart';
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../onboarding/domain/models/user_profile.dart';

final squadProvider = Provider<List<SquadMember>>((ref) {
  // Mock data for Phase 3 UI development
  return [
    SquadMember(
      id: '1',
      name: 'Ryuji',
      role: UserRole.athlete,
      isOnline: true,
      lastActive: DateTime.now().subtract(const Duration(minutes: 5)),
      stats: const UserStats(
        gutsXp: 450, // Rank 5
        kindnessXp: 120, // Rank 2
        charmXp: 80, // Rank 1
        knowledgeXp: 40, // Rank 1
        proficiencyXp: 210, // Rank 3
      ),
    ),
    SquadMember(
      id: '2',
      name: 'Makoto',
      role: UserRole.scholar,
      isOnline: false,
      lastActive: DateTime.now().subtract(const Duration(hours: 2)),
      stats: const UserStats(
        gutsXp: 300, // Rank 4
        kindnessXp: 250, // Rank 3
        charmXp: 200, // Rank 3
        knowledgeXp: 500, // Rank 5
        proficiencyXp: 350, // Rank 4
      ),
    ),
    SquadMember(
      id: '3',
      name: 'Yusuke',
      role: UserRole.creative,
      isOnline: true,
      lastActive: DateTime.now().subtract(const Duration(minutes: 1)),
      stats: const UserStats(
        gutsXp: 100, // Rank 2
        kindnessXp: 150, // Rank 2
        charmXp: 180, // Rank 2
        knowledgeXp: 200, // Rank 3
        proficiencyXp: 480, // Rank 5
      ),
    ),
  ];
});
