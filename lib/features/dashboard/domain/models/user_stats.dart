import 'package:flutter/foundation.dart';

/// Represents the 5 core stats of the user's Persona.
@immutable
class UserStats {
  final int knowledge;
  final int guts;
  final int proficiency;
  final int kindness;
  final int charm;

  const UserStats({
    this.knowledge = 1,
    this.guts = 1,
    this.proficiency = 1,
    this.kindness = 1,
    this.charm = 1,
  });

  /// The max possible rank for a stat.
  static const int maxRank = 5;

  UserStats copyWith({
    int? knowledge,
    int? guts,
    int? proficiency,
    int? kindness,
    int? charm,
  }) {
    return UserStats(
      knowledge: knowledge ?? this.knowledge,
      guts: guts ?? this.guts,
      proficiency: proficiency ?? this.proficiency,
      kindness: kindness ?? this.kindness,
      charm: charm ?? this.charm,
    );
  }

  /// Helper to get a label based on the rank.
  /// Standard P5 labels for Knowledge, for example.
  String getRankLabel(String statName, int rank) {
    switch (statName.toLowerCase()) {
      case 'knowledge':
        return ['Oblivious', 'Learned', 'Scholarly', 'Encyclopedic', 'Erudite'][rank - 1];
      case 'guts':
        return ['Milquetoast', 'Bold', 'Staunch', 'Dauntless', 'Badass'][rank - 1];
      case 'proficiency':
        return ['Bumbling', 'Decent', 'Skilled', 'Masterful', 'Transcendent'][rank - 1];
      case 'kindness':
        return ['Inoffensive', 'Considerate', 'Empathetic', 'Selfless', 'Angelic'][rank - 1];
      case 'charm':
        return ['Existent', 'Head-turning', 'Suave', 'Charismatic', 'Debonair'][rank - 1];
      default:
        return 'Rank $rank';
    }
  }
}
