import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// A custom background widget that draws the Persona 5 style 
/// halftone dots and abstract jagged shapes.
class P5Background extends StatelessWidget {
  final Widget child;
  final bool isVelvet;

  const P5Background({super.key, required this.child, this.isVelvet = false});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base dark color
        Container(color: isVelvet ? AppColors.velvetBg : AppColors.backgroundDark),
        
        if (isVelvet)
          Positioned.fill(
            child: CustomPaint(
              painter: _DiagonalStripePainter(),
            ),
          ),
          
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
      ..color = Colors.black.withOpacity(0.28)
      ..style = PaintingStyle.fill;

    const double spacing = 11.0;
    const double radius = 1.6;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _DiagonalStripePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.velvetAccent.withOpacity(0.1)
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    // A simple diagonal stripe pattern (-55deg approx)
    for (double i = -size.height; i < size.width; i += 26.0) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i + size.height * 1.5, size.height * 1.5),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
