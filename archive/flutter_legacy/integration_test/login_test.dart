import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:persona_navigator/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow Integration Test', () {
    testWidgets('Toggle to signup, enter credentials, and submit', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find the toggle button
      final toggleButton = find.text('Need a contract? Sign up');
      expect(toggleButton, findsOneWidget);

      // Tap to switch to Sign Up mode
      await tester.tap(toggleButton);
      await tester.pumpAndSettle();

      // Verify we are in Sign Up mode
      expect(find.text('FORGE CONTRACT'), findsOneWidget);
      expect(find.text('SIGN UP'), findsOneWidget);

      // Enter email
      final emailField = find.byWidgetPredicate(
        (widget) => widget is TextField && widget.decoration?.hintText == 'Email',
      );
      await tester.enterText(emailField, 'joker@phantoms.com');
      await tester.pumpAndSettle();

      // Enter password
      final passwordField = find.byWidgetPredicate(
        (widget) => widget is TextField && widget.decoration?.hintText == 'Password',
      );
      await tester.enterText(passwordField, 'morgana123');
      await tester.pumpAndSettle();

      // Submit
      final submitButton = find.text('SIGN UP');
      await tester.tap(submitButton);
      
      // We expect a loading state or navigation. Pump a few times to let async Firebase happen.
      await tester.pump(const Duration(seconds: 1));
      await tester.pump(const Duration(seconds: 1));
      await tester.pump(const Duration(seconds: 1));
    });
  });
}
