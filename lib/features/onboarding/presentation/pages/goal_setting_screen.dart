import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_button.dart';
import '../providers/onboarding_provider.dart';

/// Screen where the user selects up to 3 initial goals.
/// 
/// Logic: Uses a toggle mechanism in OnboardingNotifier. 
/// Limits selection to exactly 3 or fewer goals.
class GoalSettingScreen extends ConsumerWidget {
  const GoalSettingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedGoals = ref.watch(onboardingProvider).goals;

    // Hardcoded initial goals for MVP
    final List<String> availableGoals = [
      'Build Muscle',
      'Learn to Code',
      'Read More',
      'Make Friends',
      'Improve Focus'
    ];

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'What do you seek?',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Choose up to 3 goals. (${selectedGoals.length}/3)',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primaryRed,
                      ),
                    ),
                    const SizedBox(height: 48),
                    
                    // Goals Selection
                    ...availableGoals.map((goal) {
                      final isSelected = selectedGoals.contains(goal);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: P5Button(
                          text: goal,
                          isPrimary: isSelected,
                          onPressed: () {
                            ref.read(onboardingProvider.notifier).toggleGoal(goal);
                          },
                        ),
                      );
                    }),
                    
                    const Spacer(),
                    const SizedBox(height: 32),
                    
                    if (selectedGoals.isNotEmpty)
                      P5Button(
                        text: 'NEXT',
                        onPressed: () {
                          context.push('/morgana-intro');
                        },
                      ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
