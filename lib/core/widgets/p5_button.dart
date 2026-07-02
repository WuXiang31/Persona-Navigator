import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class P5Button extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isPrimary;

  const P5Button({
    super.key,
    required this.text,
    required this.onPressed,
    this.isPrimary = true,
  });

  @override
  State<P5Button> createState() => _P5ButtonState();
}

class _P5ButtonState extends State<P5Button> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Transform(
          transform: Matrix4.skewX(-0.15),
          alignment: Alignment.center,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            decoration: BoxDecoration(
              color: widget.isPrimary 
                  ? (_isHovered ? AppColors.primaryWhite : AppColors.primaryRed)
                  : (_isHovered ? AppColors.primaryRed : AppColors.primaryBlack),
              border: Border.all(
                color: widget.isPrimary ? AppColors.primaryRed : AppColors.primaryWhite,
                width: 3,
              ),
              boxShadow: [
                if (_isHovered)
                  const BoxShadow(
                    color: AppColors.accentYellow,
                    offset: Offset(4, 4),
                  )
                else
                  const BoxShadow(
                    color: AppColors.primaryBlack,
                    offset: Offset(6, 6),
                  ),
              ],
            ),
            child: Transform(
              transform: Matrix4.skewX(0.15), // Un-skew the text
              alignment: Alignment.center,
              child: Text(
                widget.text.toUpperCase(),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: widget.isPrimary
                      ? (_isHovered ? AppColors.primaryRed : AppColors.primaryWhite)
                      : (_isHovered ? AppColors.primaryWhite : AppColors.primaryWhite),
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
