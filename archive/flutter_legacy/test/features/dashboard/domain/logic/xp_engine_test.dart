import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/dashboard/domain/logic/xp_engine.dart';

void main() {
  group('IXpCalculator Tests', () {
    late PersonaXpCalculator calculator;

    setUp(() {
      calculator = PersonaXpCalculator();
    });

    test('calculateRank returns correct rank based on XP', () {
      expect(calculator.calculateRank(0), 1);
      expect(calculator.calculateRank(50), 1);
      expect(calculator.calculateRank(100), 2);
      expect(calculator.calculateRank(299), 2);
      expect(calculator.calculateRank(300), 3);
      expect(calculator.calculateRank(600), 4);
      expect(calculator.calculateRank(1000), 5);
      expect(calculator.calculateRank(2000), 5); // Over max
    });

    test('calculateProgress returns correct percentage', () {
      // Rank 1 (0 -> 100)
      expect(calculator.calculateProgress(50), 0.5);
      // Rank 2 (100 -> 300)
      expect(calculator.calculateProgress(100), 0.0);
      expect(calculator.calculateProgress(200), 0.5);
      // Rank 2 (100 -> 300, 250 is 150/200 = 75%)
      expect(calculator.calculateProgress(250), 0.75);
      // Max rank
      expect(calculator.calculateProgress(1000), 1.0);
      expect(calculator.calculateProgress(1500), 1.0);
    });
  });
}
