import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/quests/domain/models/weather_condition.dart';
import 'package:persona_navigator/features/quests/domain/repositories/weather_repository.dart';

void main() {
  group('OpenMeteoWeatherRepository WMO mapping', () {
    test('Maps Clear codes correctly', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(0), WeatherCondition.clear);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(1), WeatherCondition.clear);
    });

    test('Maps Cloudy codes correctly', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(2), WeatherCondition.cloudy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(3), WeatherCondition.cloudy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(45), WeatherCondition.cloudy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(48), WeatherCondition.cloudy);
    });

    test('Maps Rainy codes correctly', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(51), WeatherCondition.rainy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(61), WeatherCondition.rainy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(80), WeatherCondition.rainy);
    });

    test('Maps Snowy codes correctly', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(71), WeatherCondition.snowy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(77), WeatherCondition.snowy);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(85), WeatherCondition.snowy);
    });

    test('Maps Thunderstorm codes correctly', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(95), WeatherCondition.thunderstorm);
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(99), WeatherCondition.thunderstorm);
    });

    test('Falls back to clear for unknown codes', () {
      expect(OpenMeteoWeatherRepository.mapWmoCodeToCondition(999), WeatherCondition.clear);
    });
  });
}
