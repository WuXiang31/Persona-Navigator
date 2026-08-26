import 'package:flutter/material.dart';
import 'dart:math';

/// A custom clipper that creates the signature Persona 5 jagged, 
/// "torn paper" or angled edge look for cards and containers.
class P5JaggedClipper extends CustomClipper<Path> {
  final bool jagTop;
  final bool jagBottom;
  final bool jagLeft;
  final bool jagRight;
  final double jagDepth;

  P5JaggedClipper({
    this.jagTop = false,
    this.jagBottom = false,
    this.jagLeft = false,
    this.jagRight = false,
    this.jagDepth = 8.0,
  });

  @override
  Path getClip(Size size) {
    final path = Path();
    final random = Random(42); // Use fixed seed so the jagged edge doesn't animate/change

    // Top edge
    path.moveTo(0, jagTop ? _rand(random, jagDepth) : 0);
    if (jagTop) {
      for (double x = 20; x < size.width; x += 30) {
        path.lineTo(x, _rand(random, jagDepth));
      }
    }
    path.lineTo(size.width, jagTop ? _rand(random, jagDepth) : 0);

    // Right edge
    if (jagRight) {
      for (double y = 20; y < size.height; y += 30) {
        path.lineTo(size.width - _rand(random, jagDepth), y);
      }
    }
    path.lineTo(size.width, size.height);

    // Bottom edge
    if (jagBottom) {
      for (double x = size.width - 20; x > 0; x -= 30) {
        path.lineTo(x, size.height - _rand(random, jagDepth));
      }
    }
    path.lineTo(0, size.height);

    // Left edge
    if (jagLeft) {
      for (double y = size.height - 20; y > 0; y -= 30) {
        path.lineTo(_rand(random, jagDepth), y);
      }
    }
    path.close();

    return path;
  }

  double _rand(Random r, double max) {
    return r.nextDouble() * max;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

/// A clipper that just heavily slants the corners, creating an angled polygon.
class P5SlantedClipper extends CustomClipper<Path> {
  final double slant;

  P5SlantedClipper({this.slant = 15.0});

  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(slant, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width - slant, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

class P5JaggedBubbleClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    // 2% 4%, 98% 0%, 100% 50%, 97% 97%, 4% 100%, 0% 92%
    path.moveTo(size.width * 0.02, size.height * 0.04);
    path.lineTo(size.width * 0.98, size.height * 0.00);
    path.lineTo(size.width * 1.00, size.height * 0.50);
    path.lineTo(size.width * 0.97, size.height * 0.97);
    path.lineTo(size.width * 0.04, size.height * 1.00);
    path.lineTo(size.width * 0.00, size.height * 0.92);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

class P5CaseFileClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    // 0% 2%, 4% 0%, 96% 1%, 100% 5%, 99% 95%, 95% 100%, 5% 99%, 0% 96%
    path.moveTo(size.width * 0.00, size.height * 0.02);
    path.lineTo(size.width * 0.04, size.height * 0.00);
    path.lineTo(size.width * 0.96, size.height * 0.01);
    path.lineTo(size.width * 1.00, size.height * 0.05);
    path.lineTo(size.width * 0.99, size.height * 0.95);
    path.lineTo(size.width * 0.95, size.height * 1.00);
    path.lineTo(size.width * 0.05, size.height * 0.99);
    path.lineTo(size.width * 0.00, size.height * 0.96);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
