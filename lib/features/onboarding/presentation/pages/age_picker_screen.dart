import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_button.dart';
import '../providers/onboarding_provider.dart';

/// Screen where the user inputs their age.
/// 
/// Logic: Simple text input or slider. For MVP, we'll use a set of predefined
/// age ranges to keep the UI simple and fast.
class AgePickerScreen extends ConsumerWidget {
  const AgePickerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedAge = ref.watch(onboardingProvider).age;
    
    // Using a list of predefined ages/ranges for simplicity
    final List<int> ageOptions = [18, 25, 35, 45];

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
                      'I see...',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'And how many years have you wandered this world?',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primaryRed,
                      ),
                    ),
                    const SizedBox(height: 48),
                    
                    // Age Selection Options
                    ...ageOptions.map((ageValue) {
                      final isSelected = selectedAge == ageValue;
                      
                      String label;
                      if (ageValue == 18) label = 'Under 25';
                      else if (ageValue == 25) label = '25 - 34';
                      else if (ageValue == 35) label = '35 - 44';
                      else label = '45+';
        
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: P5Button(
                          text: label,
                          isPrimary: isSelected,
                          onPressed: () {
                            ref.read(onboardingProvider.notifier).setAge(ageValue);
                          },
                        ),
                      );
                    }),
                    
                    const Spacer(),
                    const SizedBox(height: 32),
                    
                    if (selectedAge != null)
                      P5Button(
                        text: 'NEXT',
                        onPressed: () {
                          context.push('/goal-setting');
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
