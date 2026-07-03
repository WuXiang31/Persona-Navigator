import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

// Import screens (We will create these next)
import '../../features/onboarding/presentation/pages/welcome_screen.dart';
import '../../features/onboarding/presentation/pages/role_selection_screen.dart';
import '../../features/onboarding/presentation/pages/age_picker_screen.dart';
import '../../features/onboarding/presentation/pages/goal_setting_screen.dart';
import '../../features/onboarding/presentation/pages/morgana_intro_screen.dart';
import '../../features/quests/presentation/pages/missions_screen.dart';
import '../../features/chat/presentation/pages/chat_screen.dart';

import '../../features/dashboard/presentation/pages/home_screen.dart';
import '../../features/calendar/presentation/pages/calendar_screen.dart';

import '../../features/dashboard/presentation/pages/desktop_layout.dart';

/// Central routing configuration for the application using GoRouter.
/// 
/// Logic: Uses declarative routing to manage application state and deep links.
/// The initial route is set to the Velvet Room welcome screen.
GoRouter createRouter(String initialLocation) => GoRouter(
  initialLocation: initialLocation,
  routes: [
    // --- Onboarding Flow ---
    GoRoute(
      path: '/welcome',
      builder: (context, state) => const WelcomeScreen(),
    ),
    GoRoute(
      path: '/role-selection',
      pageBuilder: (context, state) => CustomTransitionPage(
        key: state.pageKey,
        child: const RoleSelectionScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutExpo)),
            child: child,
          );
        },
      ),
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
    ShellRoute(
      builder: (context, state, child) {
        if (MediaQuery.of(context).size.width > 800) {
          return DesktopLayout(child: child);
        }
        return child;
      },
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const HomeScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        ),
        GoRoute(
          path: '/calendar',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const CalendarScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        ),
        GoRoute(
          path: '/missions',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const MissionsScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.0, 1.0),
                  end: Offset.zero,
                ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutExpo)),
                child: child,
              );
            },
          ),
        ),
        GoRoute(
          path: '/chat',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const ChatScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(1.0, 0.0),
                  end: Offset.zero,
                ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutExpo)),
                child: child,
              );
            },
          ),
        ),
      ],
    ),
  ],
);
