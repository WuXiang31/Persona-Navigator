import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/user_stats.dart';
import '../../domain/logic/xp_engine.dart';
import '../../../../core/widgets/p5_clipper.dart';

class StatRadarChart extends StatelessWidget {
  final UserStats stats;
  final IXpCalculator xpCalculator;

  const StatRadarChart({super.key, required this.stats, required this.xpCalculator});

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
                painter: _RadarChartPainter(
                  stats: stats,
                  xpCalculator: xpCalculator,
                ),
              ),
              
              // We could add the labels as positioned widgets here
              // For a true responsive layout, we place them around the center.
              _buildLabel(
                context, 
                label: 'KNOWLEDGE\n${stats.getRankLabel('knowledge', xpCalculator.calculateRank(stats.knowledgeXp))}', 
                alignment: const Alignment(0, -1.0),
              ),
              _buildLabel(
                context, 
                label: 'GUTS\n${stats.getRankLabel('guts', xpCalculator.calculateRank(stats.gutsXp))}', 
                alignment: const Alignment(1.0, -0.2),
              ),
              _buildLabel(
                context, 
                label: 'PROFICIENCY\n${stats.getRankLabel('proficiency', xpCalculator.calculateRank(stats.proficiencyXp))}', 
                alignment: const Alignment(0.8, 0.8),
              ),
              _buildLabel(
                context, 
                label: 'KINDNESS\n${stats.getRankLabel('kindness', xpCalculator.calculateRank(stats.kindnessXp))}', 
                alignment: const Alignment(-0.8, 0.8),
              ),
              _buildLabel(
                context, 
                label: 'CHARM\n${stats.getRankLabel('charm', xpCalculator.calculateRank(stats.charmXp))}', 
                alignment: const Alignment(-1.0, -0.2),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLabel(BuildContext context, {required String label, required Alignment alignment}) {
    // Labels are placed around the chart. Since we are on a white background, we can just use dark text,
    // or keep the red boxes. Let's use clean text based on the design spec.
    final parts = label.split('\n');
    return Align(
      alignment: alignment,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            parts[0].toUpperCase(),
            style: const TextStyle(
              color: AppColors.backgroundDark,
              fontWeight: FontWeight.w900,
              fontSize: 12,
              letterSpacing: 1.0,
            ),
          ),
          Text(
            parts[1].toUpperCase(),
            style: const TextStyle(
              color: AppColors.primaryRed,
              fontWeight: FontWeight.w900,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}

class _RadarChartPainter extends CustomPainter {
  final UserStats stats;
  final IXpCalculator xpCalculator;

  _RadarChartPainter({required this.stats, required this.xpCalculator});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;
    const int sides = 5;
    const int levels = 5;

    final gridPaint = Paint()
      ..color = Colors.black12
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final fillPaint = Paint()
      ..color = AppColors.primaryRed.withOpacity(0.5)
      ..style = PaintingStyle.fill;

    final fillStrokePaint = Paint()
      ..color = const Color(0xFFB00000)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

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
      xpCalculator.calculateRank(stats.knowledgeXp),
      xpCalculator.calculateRank(stats.gutsXp),
      xpCalculator.calculateRank(stats.proficiencyXp),
      xpCalculator.calculateRank(stats.kindnessXp),
      xpCalculator.calculateRank(stats.charmXp)
    ];

    final path = Path();
    for (int i = 0; i < sides; i++) {
      final rank = statValues[i];
      // Map rank (1-5) to radius ratio (0.2-1.0)
      final radius = (maxRadius / 5) * rank;
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
