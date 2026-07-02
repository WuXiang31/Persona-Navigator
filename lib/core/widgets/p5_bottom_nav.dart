import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'p5_clipper.dart';

class P5BottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const P5BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.backgroundDark,
      height: 80,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildNavItem(
            context,
            index: 0,
            icon: Icons.home,
            label: 'HOME',
            isFirst: true,
          ),
          _buildNavItem(
            context,
            index: 1,
            icon: Icons.calendar_month,
            label: 'CALENDAR',
          ),
          _buildNavItem(
            context,
            index: 2,
            icon: Icons.bar_chart,
            label: 'STATS',
          ),
          _buildNavItem(
            context,
            index: 3,
            icon: Icons.more_horiz,
            label: 'MORE',
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required IconData icon,
    required String label,
    bool isFirst = false,
    bool isLast = false,
  }) {
    final isSelected = currentIndex == index;
    
    // Calculate slant. First and last items might have flat outer edges in the mockup,
    // but the mockup shows they all have jagged/slanted edges. 
    // We will use standard skewed boxes for simplicity.
    return Expanded(
      child: GestureDetector(
        onTap: () => onTap(index),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
          child: ClipPath(
            // Use slanted clipper. We will slightly slant them to the left (negative skew)
            clipper: P5SlantedClipper(slant: 8.0),
            child: Container(
              color: isSelected ? AppColors.primaryRed : AppColors.surfaceDark,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    color: isSelected ? AppColors.primaryWhite : AppColors.primaryRed,
                    size: 28,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: isSelected ? AppColors.primaryWhite : AppColors.primaryWhite.withOpacity(0.8),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
