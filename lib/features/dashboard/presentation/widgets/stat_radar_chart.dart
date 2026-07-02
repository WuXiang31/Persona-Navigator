import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/user_stats.dart';
import '../../../../core/widgets/p5_clipper.dart';

class StatRadarChart extends StatelessWidget {
  final UserStats stats;

  const StatRadarChart({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = math.min(constraints.maxWidth, constraints.maxHeight);
        
        return SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // The Radar Chart Custom Paint
              CustomPaint(
                size: Size(size * 0.6, size * 0.6), // The web is smaller to leave room for labels
                painter: _RadarChartPainter(stats: stats),
              ),
              
              // We could add the labels as positioned widgets here
              // For a true responsive layout, we place them around the center.
              _buildLabel(
                context, 
                label: 'KNOWLEDGE\n${stats.getRankLabel('knowledge', stats.knowledge)}', 
                alignment: const Alignment(0, -1.0),
              ),
              _buildLabel(
                context, 
                label: 'GUTS\n${stats.getRankLabel('guts', stats.guts)}', 
                alignment: const Alignment(1.0, -0.2),
              ),
              _buildLabel(
                context, 
                label: 'PROFICIENCY\n${stats.getRankLabel('proficiency', stats.proficiency)}', 
                alignment: const Alignment(0.8, 0.8),
              ),
              _buildLabel(
                context, 
                label: 'KINDNESS\n${stats.getRankLabel('kindness', stats.kindness)}', 
                alignment: const Alignment(-0.8, 0.8),
              ),
              _buildLabel(
                context, 
                label: 'CHARM\n${stats.getRankLabel('charm', stats.charm)}', 
                alignment: const Alignment(-1.0, -0.2),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLabel(BuildContext context, {required String label, required Alignment alignment}) {
    // The jagged label box as seen in the mockup
    return Align(
      alignment: alignment,
      child: ClipPath(
        clipper: P5SlantedClipper(slant: 6.0),
        child: Container(
          color: AppColors.primaryWhite,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Container(
            color: AppColors.primaryRed,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Text(
              label.toUpperCase(),
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.primaryWhite,
                fontWeight: FontWeight.bold,
                height: 1.2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RadarChartPainter extends CustomPainter {
  final UserStats stats;

  _RadarChartPainter({required this.stats});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;
    const int sides = 5;
    const int levels = 5;

    final gridPaint = Paint()
      ..color = AppColors.primaryWhite
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final fillPaint = Paint()
      ..color = AppColors.primaryRed.withOpacity(0.85)
      ..style = PaintingStyle.fill;

    final fillStrokePaint = Paint()
      ..color = AppColors.primaryRed
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    // Draw the 5 concentric pentagons (Grid)
    for (int i = 1; i <= levels; i++) {
      final radius = (maxRadius / levels) * i;
      _drawPolygon(canvas, center, radius, sides, gridPaint);
    }

    // Draw the connecting lines from center to vertices
    for (int i = 0; i < sides; i++) {
      final angle = (math.pi * 2 / sides) * i - (math.pi / 2);
      final point = Offset(
        center.dx + maxRadius * math.cos(angle),
        center.dy + maxRadius * math.sin(angle),
      );
      canvas.drawLine(center, point, gridPaint);
    }

    // Draw the actual stat polygon
    final statValues = [
      stats.knowledge,
      stats.guts,
      stats.proficiency,
      stats.kindness,
      stats.charm
    ];

    final path = Path();
    for (int i = 0; i < sides; i++) {
      final rank = statValues[i];
      // Map rank (1-5) to radius ratio (0.2-1.0)
      final radius = (maxRadius / UserStats.maxRank) * rank;
      final angle = (math.pi * 2 / sides) * i - (math.pi / 2);
      
      final point = Offset(
        center.dx + radius * math.cos(angle),
        center.dy + radius * math.sin(angle),
      );

      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    path.close();

    canvas.drawPath(path, fillPaint);
    canvas.drawPath(path, fillStrokePaint);
  }

  void _drawPolygon(Canvas canvas, Offset center, double radius, int sides, Paint paint) {
    final path = Path();
    for (int i = 0; i < sides; i++) {
      // -pi/2 starts the first point at the top (12 o'clock)
      final angle = (math.pi * 2 / sides) * i - (math.pi / 2);
      final point = Offset(
        center.dx + radius * math.cos(angle),
        center.dy + radius * math.sin(angle),
      );

      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _RadarChartPainter oldDelegate) {
    return oldDelegate.stats != stats;
  }
}
