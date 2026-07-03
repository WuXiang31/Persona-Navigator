import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_bottom_nav.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_radar_chart.dart';
import '../../domain/logic/xp_engine.dart';
import '../../domain/models/user_stats.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardProvider);
    final xpCalculator = ref.watch(xpCalculatorProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header Panel (Red Halftone)
            _buildHeaderPanel(context, dashboardState.morganaMessage),
            
            // Central Radar Chart on torn case file
            Expanded(
              child: _buildCaseFileRadar(context, dashboardState.stats, xpCalculator),
            ),
            
            // Stat Chips Row
            _buildStatChips(context, dashboardState.stats, xpCalculator),
            
            const SizedBox(height: 16),
            
            // Bottom Navigation
            P5BottomNav(
              currentIndex: 0,
              onTap: (index) {
                if (index == 0) {
                  context.go('/home');
                } else if (index == 1) {
                  context.go('/missions');
                } else if (index == 2) {
                  context.go('/chat');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderPanel(BuildContext context, String message) {
    return ClipPath(
      clipper: _HeaderClipper(),
      child: Container(
        color: AppColors.primaryRed,
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Morgana Avatar (skewed black square, red "M")
                Transform(
                  transform: Matrix4.skewX(-0.14)..rotateZ(-0.05),
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: const BoxDecoration(
                      color: AppColors.backgroundDark,
                      boxShadow: [
                        BoxShadow(color: Colors.black, offset: Offset(4, 4), blurRadius: 0),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Transform(
                      transform: Matrix4.skewX(0.14),
                      child: const Text(
                        'M',
                        style: TextStyle(
                          color: AppColors.primaryWhite,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          fontSize: 26,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                
                // Speech Bubble
                Expanded(
                  child: GestureDetector(
                    onTap: () => context.push('/chat'),
                    child: ClipPath(
                      clipper: P5JaggedBubbleClipper(),
                      child: Container(
                        color: AppColors.primaryWhite,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Text(
                          message,
                          style: const TextStyle(
                            color: AppColors.backgroundDark,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // "STATUS" Title with slash divider
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text(
                  'STATUS',
                  style: TextStyle(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    fontSize: 44,
                    height: 1.0,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Transform(
                    transform: Matrix4.skewX(-0.5),
                    child: Container(
                      height: 8,
                      color: AppColors.backgroundDark,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCaseFileRadar(BuildContext context, UserStats stats, IXpCalculator xpCalculator) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      child: Transform.rotate(
        angle: -0.035, // -2deg
        child: Container(
          decoration: const BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryRed,
                offset: Offset(12, 12),
                blurRadius: 0,
              ),
            ],
          ),
          child: ClipPath(
            clipper: P5CaseFileClipper(),
            child: Container(
              color: AppColors.primaryWhite,
              padding: const EdgeInsets.all(24.0),
              child: Center(
                child: StatRadarChart(
                  stats: stats,
                  xpCalculator: xpCalculator,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatChips(BuildContext context, UserStats stats, IXpCalculator xpCalculator) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        alignment: WrapAlignment.center,
        children: [
          _buildStatChip('KNOWLEDGE', stats.knowledgeXp, xpCalculator),
          _buildStatChip('GUTS', stats.gutsXp, xpCalculator),
          _buildStatChip('PROFICIENCY', stats.proficiencyXp, xpCalculator),
          _buildStatChip('KINDNESS', stats.kindnessXp, xpCalculator),
          _buildStatChip('CHARM', stats.charmXp, xpCalculator),
        ],
      ),
    );
  }

  Widget _buildStatChip(String name, int xp, IXpCalculator xpCalculator) {
    final rank = xpCalculator.calculateRank(xp);
    return Transform(
      transform: Matrix4.skewX(-0.14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        color: AppColors.surfaceDark,
        child: Transform(
          transform: Matrix4.skewX(0.14),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                name,
                style: const TextStyle(
                  color: AppColors.primaryWhite,
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                color: AppColors.primaryRed,
                child: Text(
                  'Lv $rank',
                  style: const TextStyle(
                    color: AppColors.primaryWhite,
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
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

class _HeaderClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height * 0.88);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
