import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../../../core/widgets/p5_bottom_nav.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_radar_chart.dart';

/// The main dashboard screen displaying stats, Morgana, and quests.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            // Morgana Top Dialogue
            _buildMorganaDialogue(context, dashboardState.morganaMessage),
            
            // Central Radar Chart
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                child: StatRadarChart(stats: dashboardState.stats),
              ),
            ),
            
            // Action Buttons
            _buildActionButtons(context),
            
            // Bottom Navigation
            P5BottomNav(
              currentIndex: 0,
              onTap: (index) {
                // Future routing logic
                debugPrint('Tapped nav index: $index');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMorganaDialogue(BuildContext context, String message) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar placeholder
          Container(
            width: 80,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.primaryRed,
              border: Border.all(color: AppColors.primaryWhite, width: 3),
            ),
            child: const Center(
              child: Icon(Icons.pets, size: 40, color: AppColors.primaryWhite),
            ),
          ),
          const SizedBox(width: 12),
          // Dialogue bubble
          Expanded(
            child: ClipPath(
              clipper: P5JaggedClipper(jagRight: true, jagDepth: 5.0),
              child: Container(
                color: AppColors.primaryRed,
                padding: const EdgeInsets.all(16),
                child: Text(
                  message,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      child: Row(
        children: [
          Expanded(
            child: ClipPath(
              clipper: P5SlantedClipper(slant: 12.0),
              child: Material(
                color: AppColors.primaryRed,
                child: InkWell(
                  onTap: () {},
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'QUICK LOG',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.primaryWhite,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ClipPath(
              clipper: P5SlantedClipper(slant: -12.0), // Slant other way
              child: Material(
                color: AppColors.primaryWhite,
                child: InkWell(
                  onTap: () {
                    context.push('/missions');
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'ACTIVE QUESTS',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.backgroundDark,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
