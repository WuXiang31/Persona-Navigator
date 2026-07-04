import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
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


