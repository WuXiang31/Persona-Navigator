import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../constants/app_colors.dart';

class P5BottomNav extends StatelessWidget {
  final int currentIndex;

  const P5BottomNav({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.backgroundDark,
      height: 80,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildNavItem(
            context,
            index: 0,
            label: 'HOME',
          ),
          _buildNavItem(
            context,
            index: 1,
            label: 'MISSIONS',
          ),
          _buildNavItem(
            context,
            index: 2,
            label: 'CHAT',
          ),
          _buildNavItem(
            context,
            index: 3,
            label: 'SQUAD',
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required String label,
  }) {
    final isSelected = currentIndex == index;
    
    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (index == 0) context.go('/home');
          else if (index == 1) context.go('/missions');
          else if (index == 2) context.go('/chat');
          else if (index == 3) context.go('/squad');
        },
        child: Transform(
          transform: Matrix4.skewX(-0.14),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            color: isSelected ? AppColors.primaryRed : AppColors.surfaceDark,
            child: Center(
              child: Transform(
                transform: Matrix4.skewX(0.14),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? AppColors.primaryWhite : Colors.grey,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      letterSpacing: 2.0,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
