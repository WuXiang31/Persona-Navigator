import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';

void main() {
  runApp(
    const ProviderScope(
      child: PersonaNavigatorApp(),
    ),
  );
}

class PersonaNavigatorApp extends StatelessWidget {
  const PersonaNavigatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Persona Navigator',
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}

class TestScreen extends StatelessWidget {
  const TestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'THE VELVET ROOM',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 40),
            P5Button(
              text: 'START JOURNEY',
              onPressed: () {
                debugPrint('Start pressed');
              },
            ),
            const SizedBox(height: 20),
            P5Button(
              text: 'OPTIONS',
              isPrimary: false,
              onPressed: () {
                debugPrint('Options pressed');
              },
            ),
          ],
        ),
      ),
    );
  }
}
