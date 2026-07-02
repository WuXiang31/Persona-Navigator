import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/p5_button.dart';
import '../../../../core/constants/app_colors.dart';

/// The entry point of the app's onboarding flow, inspired by the Velvet Room.
/// 
/// Logic: Displays a dramatic introduction and waits for the user to proceed.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Welcome to the\nVelvet Room...',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: AppColors.primaryRed,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              Text(
                'Your journey of self-improvement begins now.',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.primaryWhite.withOpacity(0.8),
                  fontWeight: FontWeight.normal,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 80),
              P5Button(
                text: 'ENTER',
                onPressed: () {
                  // Navigate to role selection
                  context.push('/role-selection');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
