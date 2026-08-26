/// Defines the primary roles a user can select during onboarding.
/// This determines their default stat labels and starting quests.
enum UserRole {
  scholar,
  professional,
  creative,
  athlete,
  explorer;

  String get displayName {
    switch (this) {
      case UserRole.scholar:
        return 'The Scholar';
      case UserRole.professional:
        return 'The Professional';
      case UserRole.creative:
        return 'The Creative';
      case UserRole.athlete:
        return 'The Athlete';
      case UserRole.explorer:
        return 'The Explorer';
    }
  }

  String get numeral {
    switch (this) {
      case UserRole.scholar:
        return 'I';
      case UserRole.professional:
        return 'II';
      case UserRole.creative:
        return 'III';
      case UserRole.athlete:
        return 'IV';
      case UserRole.explorer:
        return 'V';
    }
  }

  String get description {
    switch (this) {
      case UserRole.scholar:
        return 'Focuses on Knowledge and Proficiency. For those who study the world.';
      case UserRole.professional:
        return 'Focuses on Charm and Knowledge. For those who navigate society.';
      case UserRole.creative:
        return 'Focuses on Proficiency and Charm. For those who make things.';
      case UserRole.athlete:
        return 'Focuses on Guts and Kindness (Vitality). For those who push their limits.';
      case UserRole.explorer:
        return 'Focuses on Guts and Proficiency. For those who seek the unknown.';
    }
  }
}

/// Represents the user's initial configuration collected during the
/// Velvet Room onboarding flow.
///
/// Data Structure: Immutable model representing the application state.
/// We use 'copyWith' to enable immutable state updates in Riverpod.
class UserProfile {
  final UserRole? role;
  final int? age;
  final List<String> goals;
  
  const UserProfile({
    this.role,
    this.age,
    this.goals = const [],
  });

  /// Creates a new instance of UserProfile with updated fields.
  UserProfile copyWith({
    UserRole? role,
    int? age,
    List<String>? goals,
  }) {
    return UserProfile(
      role: role ?? this.role,
      age: age ?? this.age,
      goals: goals ?? this.goals,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      role: json['role'] != null
          ? UserRole.values.firstWhere(
              (e) => e.name == json['role'],
              orElse: () => UserRole.scholar,
            )
          : null,
      age: json['age'] as int?,
      goals: (json['goals'] as List<dynamic>?)?.map((e) => e as String).toList() ?? const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role?.name,
      'age': age,
      'goals': goals,
    };
  }

  /// Validates if the onboarding profile is complete
  bool get isComplete => role != null;
}
