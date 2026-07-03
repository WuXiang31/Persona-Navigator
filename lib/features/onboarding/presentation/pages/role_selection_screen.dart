import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/user_profile.dart';
import '../providers/onboarding_provider.dart';

class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedRole = ref.watch(onboardingProvider).role;

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 74, 22, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'CHOOSE\nYOUR MASK',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  fontStyle: FontStyle.italic,
                  height: 0.95,
                  color: AppColors.primaryWhite,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'YOUR ROLE TUNES WHICH STATS MATTER MOST.',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 18),
              
              Expanded(
                child: ListView.separated(
                  itemCount: UserRole.values.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final role = UserRole.values[index];
                    final isSelected = role == selectedRole;
                    
                    return GestureDetector(
                      onTap: () {
                        ref.read(onboardingProvider.notifier).setRole(role);
                      },
                      child: Transform(
                        transform: Matrix4.skewX(-0.14), // -8 degrees
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primaryRed : AppColors.surfaceDark,
                            border: Border.all(
                              color: isSelected ? AppColors.primaryRed : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  // Numeral Chip
                                  Container(
                                    width: 34,
                                    height: 34,
                                    color: isSelected ? AppColors.primaryWhite : AppColors.backgroundDark,
                                    alignment: Alignment.center,
                                    child: Transform(
                                      transform: Matrix4.skewX(0.14), // unskew
                                      child: Text(
                                        role.numeral,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontStyle: FontStyle.italic,
                                          fontSize: 16,
                                          color: isSelected ? AppColors.primaryRed : AppColors.primaryWhite,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Transform(
                                    transform: Matrix4.skewX(0.14), // unskew text slightly if needed, but the design says text stays unskewed by being in a child, actually we can just apply unskew to the text.
                                    child: Text(
                                      role.displayName.toUpperCase(),
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontStyle: FontStyle.italic,
                                        fontSize: 20,
                                        letterSpacing: 1.0,
                                        color: isSelected ? AppColors.primaryWhite : AppColors.primaryWhite,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (isSelected) ...[
                                const SizedBox(height: 8),
                                Padding(
                                  padding: const EdgeInsets.only(left: 46.0),
                                  child: Transform(
                                    transform: Matrix4.skewX(0.14),
                                    child: Text(
                                      role.description,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        height: 1.35,
                                        color: AppColors.primaryWhite,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              if (selectedRole != null)
                Align(
                  alignment: Alignment.center,
                  child: GestureDetector(
                    onTap: () => context.push('/age-picker'),
                    child: Transform(
                      transform: Matrix4.skewX(-0.14),
                      child: Container(
                        margin: const EdgeInsets.only(top: 14),
                        padding: const EdgeInsets.symmetric(horizontal: 60, vertical: 14),
                        decoration: const BoxDecoration(
                          color: AppColors.primaryRed,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black,
                              offset: Offset(6, 6),
                              blurRadius: 0,
                            ),
                          ],
                        ),
                        child: const Text(
                          'CONFIRM',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontStyle: FontStyle.italic,
                            fontSize: 20,
                            letterSpacing: 2.0,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
