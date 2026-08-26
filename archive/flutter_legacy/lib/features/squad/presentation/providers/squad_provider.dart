import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/models/squad_member.dart';
import '../../../dashboard/domain/models/user_stats.dart';
import '../../../onboarding/domain/models/user_profile.dart';

final squadProvider = StreamProvider<List<SquadMember>>((ref) {
  return FirebaseFirestore.instance.collection('users').snapshots().map((snapshot) {
    return snapshot.docs.map((doc) {
      final data = doc.data();
      
      UserStats stats = const UserStats();
      if (data['stats'] != null) {
        stats = UserStats.fromJson(data['stats'] as Map<String, dynamic>);
      }
      
      return SquadMember(
        id: doc.id,
        name: data['name'] ?? 'Unknown User',
        role: UserRole.values.firstWhere(
          (e) => e.name == (data['role'] ?? 'athlete'),
          orElse: () => UserRole.athlete,
        ),
        isOnline: true,
        lastActive: data['lastActive'] != null 
            ? (data['lastActive'] as Timestamp).toDate() 
            : DateTime.now(),
        stats: stats,
      );
    }).toList();
  });
});
