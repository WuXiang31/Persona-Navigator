import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/models/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

class FirebaseAuthRepository implements AuthRepository {
  final firebase_auth.FirebaseAuth _firebaseAuth;

  FirebaseAuthRepository({firebase_auth.FirebaseAuth? firebaseAuth})
      : _firebaseAuth = firebaseAuth ?? firebase_auth.FirebaseAuth.instance;

  AuthUser _mapFirebaseUser(firebase_auth.User? user) {
    if (user == null) {
      throw Exception('User is null');
    }
    return AuthUser(
      id: user.uid,
      email: user.email ?? '',
      displayName: user.displayName,
    );
  }

  @override
  Stream<AuthUser?> get authStateChanges {
    return _firebaseAuth.authStateChanges().map((user) {
      if (user == null) return null;
      return AuthUser(
        id: user.uid,
        email: user.email ?? '',
        displayName: user.displayName,
      );
    });
  }

  @override
  AuthUser? get currentUser {
    final user = _firebaseAuth.currentUser;
    if (user == null) return null;
    return AuthUser(
      id: user.uid,
      email: user.email ?? '',
      displayName: user.displayName,
    );
  }

  @override
  Future<AuthUser> signInWithEmailAndPassword(String email, String password) async {
    final userCredential = await _firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return _mapFirebaseUser(userCredential.user);
  }

  @override
  Future<AuthUser> createUserWithEmailAndPassword(String email, String password) async {
    final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    
    // Create default user profile in Firestore
    final user = userCredential.user;
    if (user != null) {
      await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
        'name': email.split('@').first,
        'role': 'athlete',
        'lastActive': FieldValue.serverTimestamp(),
        'stats': {
          'knowledge': 1,
          'guts': 1,
          'proficiency': 1,
          'kindness': 1,
          'charm': 1,
        }
      });
    }
    
    return _mapFirebaseUser(user);
  }

  @override
  Future<void> signOut() async {
    await _firebaseAuth.signOut();
  }
}
