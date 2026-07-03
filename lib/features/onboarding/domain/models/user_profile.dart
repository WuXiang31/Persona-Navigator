/// Defines the primary roles a user can select during onboarding.
/// This determines their default stat labels and starting quests.
enum UserRole {
  student,
  professional,
  creative;

  String get displayName {
    switch (this) {
      case UserRole.student:
        return 'Student';
      case UserRole.professional:
        return 'Professional';
      case UserRole.creative:
        return 'Creative';
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
              orElse: () => UserRole.student,
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
  bool get isComplete => role != null && age != null && goals.isNotEmpty;
}
