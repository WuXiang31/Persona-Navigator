import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// A custom background widget that draws the Persona 5 style 
/// halftone dots and abstract jagged shapes.
class P5Background extends StatelessWidget {
  final Widget child;

  const P5Background({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base dark color
        Container(color: AppColors.backgroundDark),
        
        // Halftone dots using CustomPainter
        Positioned.fill(
          child: CustomPaint(
            painter: _HalftonePainter(),
          ),
        ),
        
        // Watermark Text
        Positioned(
          right: -50,
          top: 100,
          child: Transform.rotate(
            angle: -0.2,
            child: Text(
              'TAKE\nYOUR\nTIME',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                fontSize: 120,
                height: 0.8,
                color: AppColors.primaryRed.withOpacity(0.15),
              ),
            ),
          ),
        ),
        
        // The actual content
        SafeArea(child: child),
      ],
    );
  }
}

class _HalftonePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..style = PaintingStyle.fill;

    const double spacing = 12.0;
    const double radius = 2.0;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        // Create a gradient effect by changing radius based on position
        // Top right has smaller dots, bottom left has larger
        double adjustedRadius = radius * (1 - (x / size.width) * 0.5);
        canvas.drawCircle(Offset(x, y), adjustedRadius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
