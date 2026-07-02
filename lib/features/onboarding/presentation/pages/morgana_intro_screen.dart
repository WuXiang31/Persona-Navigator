import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_button.dart';
import '../providers/onboarding_provider.dart';

/// The final screen of onboarding where the user meets Morgana.
/// 
/// Logic: Displays a final introductory message, saves the UserProfile state,
/// and redirects to the Home screen.
class MorganaIntroScreen extends ConsumerWidget {
  const MorganaIntroScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'I am Morgana.',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: AppColors.primaryRed,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    // In the future, an image of Morgana would go here.
                    Container(
                      height: 150,
                      width: 150,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.surfaceDark,
                        border: Border.all(color: AppColors.primaryRed, width: 4),
                      ),
                      child: const Center(
                        child: Icon(Icons.pets, size: 64, color: AppColors.primaryWhite),
                      ),
                    ),
                    const SizedBox(height: 48),
                    Text(
                      'I will be your navigator.\nLet\'s start this rehabilitation.',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primaryWhite.withOpacity(0.8),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 80),
                    P5Button(
                      text: 'AWAKEN',
                      onPressed: () async {
                        // Finalize onboarding and go home
                        await ref.read(onboardingProvider.notifier).completeOnboarding();
                        if (context.mounted) {
                          context.go('/home');
                        }
                      },
                    ),
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
