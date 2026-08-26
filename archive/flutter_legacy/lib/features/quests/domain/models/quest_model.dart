import 'package:flutter/foundation.dart';

enum TimeSlot {
  morning,
  afternoon,
  evening,
  night,
}

enum StatType {
  knowledge,
  guts,
  proficiency,
  kindness,
  charm,
}

@immutable
class Quest {
  final String id;
  final String title;
  final StatType targetStat;
  final int xpReward;
  final TimeSlot timeSlot;
  final bool isCompleted;

  const Quest({
    required this.id,
    required this.title,
    required this.targetStat,
    required this.xpReward,
    required this.timeSlot,
    this.isCompleted = false,
  });

  Quest copyWith({
    String? id,
    String? title,
    StatType? targetStat,
    int? xpReward,
    TimeSlot? timeSlot,
    bool? isCompleted,
  }) {
    return Quest(
      id: id ?? this.id,
      title: title ?? this.title,
      targetStat: targetStat ?? this.targetStat,
      xpReward: xpReward ?? this.xpReward,
      timeSlot: timeSlot ?? this.timeSlot,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

extension StatTypeExtension on StatType {
  String get glyph {
    switch (this) {
      case StatType.knowledge:
        return '◆';
      case StatType.guts:
        return '▲';
      case StatType.proficiency:
        return '⬢';
      case StatType.kindness:
        return '⚡';
      case StatType.charm:
        return '★';
    }
  }
}
