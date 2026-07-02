import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

// Import screens (We will create these next)
import '../../features/onboarding/presentation/pages/welcome_screen.dart';
import '../../features/onboarding/presentation/pages/role_selection_screen.dart';
import '../../features/onboarding/presentation/pages/age_picker_screen.dart';
import '../../features/onboarding/presentation/pages/goal_setting_screen.dart';
import '../../features/onboarding/presentation/pages/morgana_intro_screen.dart';

// Placeholder for Home
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('HOME')));
}

/// Central routing configuration for the application using GoRouter.
/// 
/// Logic: Uses declarative routing to manage application state and deep links.
/// The initial route is set to the Velvet Room welcome screen.
final GoRouter appRouter = GoRouter(
  initialLocation: '/welcome',
  routes: [
    // --- Onboarding Flow ---
    GoRoute(
      path: '/welcome',
      builder: (context, state) => const WelcomeScreen(),
    ),
    GoRoute(
      path: '/role-selection',
      builder: (context, state) => const RoleSelectionScreen(),
    ),
    GoRoute(
      path: '/age-picker',
      builder: (context, state) => const AgePickerScreen(),
    ),
    GoRoute(
      path: '/goal-setting',
      builder: (context, state) => const GoalSettingScreen(),
    ),
    GoRoute(
      path: '/morgana-intro',
      builder: (context, state) => const MorganaIntroScreen(),
    ),
    
    // --- Main App ---
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
  ],
);
