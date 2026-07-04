import 'package:flutter/foundation.dart';
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../onboarding/domain/models/user_profile.dart';

/// Represents another player in the user's "Squad".
@immutable
class SquadMember {
  final String id;
  final String name;
  final UserRole role;
  final UserStats stats;
  final bool isOnline;
  final DateTime lastActive;

  const SquadMember({
    required this.id,
    required this.name,
    required this.role,
    required this.stats,
    this.isOnline = false,
    required this.lastActive,
  });
}
