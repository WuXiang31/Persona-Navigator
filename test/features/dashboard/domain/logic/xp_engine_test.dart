import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/dashboard/domain/logic/xp_engine.dart';

void main() {
  group('XpEngine Tests', () {
    test('calculateRank returns correct rank based on XP', () {
      expect(XpEngine.calculateRank(0), 1);
      expect(XpEngine.calculateRank(50), 1);
      expect(XpEngine.calculateRank(100), 2);
      expect(XpEngine.calculateRank(299), 2);
      expect(XpEngine.calculateRank(300), 3);
      expect(XpEngine.calculateRank(599), 3);
      expect(XpEngine.calculateRank(600), 4);
      expect(XpEngine.calculateRank(999), 4);
      expect(XpEngine.calculateRank(1000), 5);
      expect(XpEngine.calculateRank(5000), 5); // Exceeds max
    });

    test('calculateProgress returns correct percentage', () {
      // Rank 1 to 2 requires 100 XP
      expect(XpEngine.calculateProgress(0), 0.0);
      expect(XpEngine.calculateProgress(50), 0.5);
      
      // Rank 2 to 3 requires 200 XP (300 - 100)
      expect(XpEngine.calculateProgress(100), 0.0);
      expect(XpEngine.calculateProgress(200), 0.5);
      expect(XpEngine.calculateProgress(250), 0.75);

      // Max rank returns 1.0
      expect(XpEngine.calculateProgress(1000), 1.0);
      expect(XpEngine.calculateProgress(1500), 1.0);
    });
  });
}
