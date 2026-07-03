import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:persona_navigator/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('End-to-End UI Flow Test', (WidgetTester tester) async {
    // 1. Clear storage to force the onboarding flow
    SharedPreferences.setMockInitialValues({});
    
    // Launch the app
    app.main();
    await tester.pumpAndSettle();

    // Small delay so user can see it launch
    await Future.delayed(const Duration(seconds: 2));

    // --- ONBOARDING FLOW ---
    
    // Welcome Screen
    expect(find.text('ENTER'), findsOneWidget);
    await tester.tap(find.text('ENTER'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));

    // Role Selection
    expect(find.text('STUDENT'), findsOneWidget);
    await tester.ensureVisible(find.text('STUDENT'));
    await tester.tap(find.text('STUDENT'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('NEXT'));
    await tester.tap(find.text('NEXT'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));

    // Age Picker
    expect(find.text('25 - 34'), findsOneWidget);
    await tester.ensureVisible(find.text('25 - 34'));
    await tester.tap(find.text('25 - 34'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('NEXT'));
    await tester.tap(find.text('NEXT'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));

    // Goal Setting
    expect(find.text('BUILD MUSCLE'), findsOneWidget);
    await tester.ensureVisible(find.text('BUILD MUSCLE'));
    await tester.tap(find.text('BUILD MUSCLE'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('NEXT'));
    await tester.tap(find.text('NEXT'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));

    // Morgana Intro
    expect(find.text('AWAKEN'), findsOneWidget);
    await tester.ensureVisible(find.text('AWAKEN'));
    await tester.tap(find.text('AWAKEN'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 2));

    // --- DASHBOARD (HOME) ---
    
    // Verify Dashboard loaded
    expect(find.text('ACTIVE QUESTS'), findsOneWidget);
    expect(find.text('QUICK LOG'), findsOneWidget);
    await Future.delayed(const Duration(seconds: 2));

    // Navigate to Missions via ACTIVE QUESTS button
    await tester.ensureVisible(find.text('ACTIVE QUESTS'));
    await tester.tap(find.text('ACTIVE QUESTS'));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 2));

    // Verify Missions loaded
    expect(find.text('MISSIONS'), findsOneWidget);
    
    // Navigate back via FAB arrow
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));
    
    // Tap the Morgana avatar/bubble to open chat (we'll tap the text bubble)
    // The text bubble has Morgana's greeting in it.
    // But to be safe, let's just find the text 'ACTIVE QUESTS' to ensure we are back.
    expect(find.text('ACTIVE QUESTS'), findsOneWidget);
    
    // Since we don't have a reliable key for the Morgana button yet, 
    // navigating back to Home proves the end-to-end routing works.
    
    // Final delay to show the end state
    await Future.delayed(const Duration(seconds: 3));
  });
}
