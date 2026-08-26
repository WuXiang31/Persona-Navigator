import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../data/repositories/firebase_auth_repository.dart';
import '../../domain/models/auth_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return FirebaseAuthRepository();
});

final authStateProvider = StreamProvider<AuthUser?>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.authStateChanges;
});

final authProvider = AsyncNotifierProvider<AuthNotifier, AuthUser?>(() {
  return AuthNotifier();
});

class AuthNotifier extends AsyncNotifier<AuthUser?> {
  late AuthRepository _authRepository;

  @override
  FutureOr<AuthUser?> build() {
    _authRepository = ref.watch(authRepositoryProvider);

    final sub = _authRepository.authStateChanges.listen((user) {
      state = AsyncValue.data(user);
    });
    ref.onDispose(() => sub.cancel());

    return _authRepository.currentUser;
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authRepository.signInWithEmailAndPassword(email, password);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signUp(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authRepository.createUserWithEmailAndPassword(email, password);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    await _authRepository.signOut();
  }
}
