import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:persona_navigator/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Desktop UI Flow Test', (WidgetTester tester) async {
    // 1. Bypass onboarding by setting it as complete
    SharedPreferences.setMockInitialValues({'onboarding_complete': true});
    
    // Set up app
    await tester.pumpWidget(
      const ProviderScope(
        child: app.PersonaNavigatorApp(initialRoute: '/home'),
      ),
    );
    await tester.pumpAndSettle();

    // Small delay so user can see it launch
    await Future.delayed(const Duration(seconds: 2));

    // --- DESKTOP LAYOUT ---
    
    // Verify Desktop layout loaded (Wait for it, it might need to check if width > 800)
    // If it's on macos it should be > 800. We should see "MISSIONS" in the sidebar
    expect(find.text('MISSIONS'), findsWidgets);
    await Future.delayed(const Duration(seconds: 1));

    // Tap on the 'MISSIONS' button in the sidebar
    // Since there might be multiple "MISSIONS" texts (sidebar, and title), let's find the one in the sidebar.
    // Actually tapping the text 'MISSIONS' is fine, it will tap the first one.
    await tester.tap(find.text('MISSIONS').first);
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 2));

    // Verify Missions screen loaded
    expect(find.byIcon(Icons.add), findsOneWidget);
    
    // Tap the FAB to add a new mission
    await tester.ensureVisible(find.byIcon(Icons.add));
    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));
    
    // Tap the 'Manual' segment to avoid AI generation in test
    await tester.tap(find.text('Manual'));
    await tester.pumpAndSettle();
    
    // Fill out the custom mission dialog
    await tester.enterText(find.byType(TextField).first, 'Automated Desktop Test Mission');
    await tester.pumpAndSettle();
    await Future.delayed(const Duration(seconds: 1));
    
    // Tap 'SAVE MISSION'
    await tester.tap(find.text('SAVE MISSION'));
    
    await tester.pumpAndSettle();
    
    // Verify Toast appears ("MISSION ADDED")
    await Future.delayed(const Duration(milliseconds: 500));
    await tester.pump();
    expect(find.text('MISSION ADDED'), findsOneWidget);
    await Future.delayed(const Duration(seconds: 3));
    
    // Test completing the mission
    // Wait for the custom mission to appear
    await tester.pumpAndSettle();
    
    // Check it off
    // There should be an icon or checkbox for 'Automated Desktop Test Mission'
    // Tap the text to toggle it
    await tester.tap(find.text('AUTOMATED DESKTOP TEST MISSION').first);
    await tester.pumpAndSettle();
    
    // Verify Toast appears ("MISSION CLEARED")
    await Future.delayed(const Duration(milliseconds: 500));
    await tester.pump();
    expect(find.text('MISSION CLEARED'), findsOneWidget);
    
    await Future.delayed(const Duration(seconds: 3));
  });
}
