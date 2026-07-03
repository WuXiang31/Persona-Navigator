import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_background.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.velvetBg,
      body: P5Background(
        isVelvet: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'WELCOME TO THE THRESHOLD',
                style: TextStyle(
                  color: AppColors.velvetAccent,
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                  letterSpacing: 6.0,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'PERSONA\nNAVIGATOR',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: AppColors.primaryWhite,
                  fontSize: 62,
                  height: 0.92,
                ),
              ),
              const SizedBox(height: 22),
              
              // Tagline chips
              Align(
                alignment: Alignment.centerLeft,
                child: Transform(
                  transform: Matrix4.skewX(-0.14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    color: AppColors.primaryWhite,
                    child: const Text(
                      'YOUR REAL LIFE IS THE DUNGEON.',
                      style: TextStyle(
                        color: AppColors.velvetBg,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: Transform(
                  transform: Matrix4.skewX(-0.14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    color: AppColors.primaryRed,
                    child: const Text(
                      'TIME TO CLEAR IT.',
                      style: TextStyle(
                        color: AppColors.primaryWhite,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 56),
              
              // Begin Button
              Align(
                alignment: Alignment.centerLeft,
                child: GestureDetector(
                  onTap: () => context.push('/role-selection'),
                  child: Transform(
                    transform: Matrix4.skewX(-0.14)..rotateZ(-0.035), // -8deg skew, -2deg rotate
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 54, vertical: 18),
                      decoration: const BoxDecoration(
                        color: AppColors.primaryRed,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black,
                            offset: Offset(8, 8),
                            blurRadius: 0,
                          ),
                        ],
                      ),
                      child: const Text(
                        'BEGIN',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          fontSize: 28,
                          letterSpacing: 3.0,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              
              const Spacer(),
              
              const Text(
                'TAKE IT ONE DAY AT A TIME',
                style: TextStyle(
                  color: Colors.white38,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 4.0,
                ),
              ),
              const SizedBox(height: 14),
            ],
          ),
        ),
      ),
    );
  }
}
