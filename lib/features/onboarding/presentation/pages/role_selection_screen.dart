import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_button.dart';
import '../../domain/models/user_profile.dart';
import '../providers/onboarding_provider.dart';

/// Screen where the user selects their 'Persona' (role) in life.
/// 
/// Logic: Uses Riverpod to update the OnboardingNotifier state when a role
/// is selected. This choice will determine stat labels later.
class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the current state to highlight the selected role
    final selectedRole = ref.watch(onboardingProvider).role;

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Tell me about yourself...',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 16),
            Text(
              'What is your primary focus?',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.primaryRed,
              ),
            ),
            const SizedBox(height: 48),
            
            // Render a button for each role
            ...UserRole.values.map((role) {
              final isSelected = role == selectedRole;
              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: P5Button(
                  text: role.displayName,
                  isPrimary: isSelected,
                  onPressed: () {
                    ref.read(onboardingProvider.notifier).setRole(role);
                  },
                ),
              );
            }),
            
            const Spacer(),
            
            // Only show Next button if a role is selected
            if (selectedRole != null)
              P5Button(
                text: 'NEXT',
                onPressed: () {
                  context.push('/age-picker');
                },
              ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
