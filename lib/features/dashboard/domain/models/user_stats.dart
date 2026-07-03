import 'package:flutter/foundation.dart';
import '../logic/xp_engine.dart';

/// Represents the 5 core stats of the user's Persona.
/// We track the raw XP, and compute the rank dynamically.
@immutable
class UserStats {
  final int knowledgeXp;
  final int gutsXp;
  final int proficiencyXp;
  final int kindnessXp;
  final int charmXp;
  final DateTime? lastActiveDate;

  const UserStats({
    this.knowledgeXp = 0,
    this.gutsXp = 0,
    this.proficiencyXp = 0,
    this.kindnessXp = 0,
    this.charmXp = 0,
    this.lastActiveDate,
  });

  UserStats copyWith({
    int? knowledgeXp,
    int? gutsXp,
    int? proficiencyXp,
    int? kindnessXp,
    int? charmXp,
    DateTime? lastActiveDate,
  }) {
    return UserStats(
      knowledgeXp: knowledgeXp ?? this.knowledgeXp,
      gutsXp: gutsXp ?? this.gutsXp,
      proficiencyXp: proficiencyXp ?? this.proficiencyXp,
      kindnessXp: kindnessXp ?? this.kindnessXp,
      charmXp: charmXp ?? this.charmXp,
      lastActiveDate: lastActiveDate ?? this.lastActiveDate,
    );
  }

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      knowledgeXp: json['knowledgeXp'] as int? ?? 0,
      gutsXp: json['gutsXp'] as int? ?? 0,
      proficiencyXp: json['proficiencyXp'] as int? ?? 0,
      kindnessXp: json['kindnessXp'] as int? ?? 0,
      charmXp: json['charmXp'] as int? ?? 0,
      lastActiveDate: json['lastActiveDate'] != null 
          ? DateTime.tryParse(json['lastActiveDate'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'knowledgeXp': knowledgeXp,
      'gutsXp': gutsXp,
      'proficiencyXp': proficiencyXp,
      'kindnessXp': kindnessXp,
      'charmXp': charmXp,
      if (lastActiveDate != null) 'lastActiveDate': lastActiveDate!.toIso8601String(),
    };
  }

  /// Helper to get a label based on the rank.
  String getRankLabel(String statName, int rank) {
    return ['Novice', 'Apprentice', 'Adept', 'Expert', 'Master'][rank - 1];
  }
}
