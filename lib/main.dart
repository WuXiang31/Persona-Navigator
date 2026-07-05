import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  _injectPhantomThieves();

  final prefs = await SharedPreferences.getInstance();
  final hasProfile = prefs.getString('user_profile') != null;

  runApp(
    ProviderScope(
      child: PersonaNavigatorApp(initialRoute: hasProfile ? '/home' : '/welcome'),
    ),
  );
}

class PersonaNavigatorApp extends StatelessWidget {
  final String initialRoute;
  const PersonaNavigatorApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Persona Navigator',
      theme: AppTheme.darkTheme,
      routerConfig: createRouter(initialRoute),
      debugShowCheckedModeBanner: false,
    );
  }
}

void _injectPhantomThieves() async {
  final db = FirebaseFirestore.instance.collection('users');
  
  final thieves = {
    'ryuji': {'name': 'Ryuji', 'role': 'athlete', 'knowledge': 2, 'guts': 4, 'proficiency': 3, 'kindness': 3, 'charm': 2},
    'ann': {'name': 'Ann', 'role': 'artist', 'knowledge': 3, 'guts': 2, 'proficiency': 2, 'kindness': 4, 'charm': 5},
    'yusuke': {'name': 'Yusuke', 'role': 'scholar', 'knowledge': 4, 'guts': 3, 'proficiency': 5, 'kindness': 2, 'charm': 3},
  };

  for (var entry in thieves.entries) {
    await db.doc(entry.key).set({
      'name': entry.value['name'],
      'role': entry.value['role'],
      'lastActive': FieldValue.serverTimestamp(),
      'stats': {
        'knowledge': entry.value['knowledge'],
        'guts': entry.value['guts'],
        'proficiency': entry.value['proficiency'],
        'kindness': entry.value['kindness'],
        'charm': entry.value['charm'],
      }
    }, SetOptions(merge: true));
  }
}
