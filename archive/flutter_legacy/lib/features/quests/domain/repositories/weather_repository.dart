import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../models/weather_condition.dart';

abstract class IWeatherRepository {
  Future<WeatherCondition> getCurrentWeather(double latitude, double longitude);
}

class OpenMeteoWeatherRepository implements IWeatherRepository {
  @override
  Future<WeatherCondition> getCurrentWeather(double latitude, double longitude) async {
    final url = Uri.parse(
        'https://api.open-meteo.com/v1/forecast?latitude=$latitude&longitude=$longitude&current_weather=true');

    try {
      final response = await http.get(url);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final weatherCode = data['current_weather']['weathercode'] as int;
        return mapWmoCodeToCondition(weatherCode);
      } else {
        throw Exception('Failed to load weather');
      }
    } catch (e) {
      // Fallback in case of error (no internet, timeout)
      return WeatherCondition.clear;
    }
  }

  /// Maps WMO Weather interpretation codes (0-99) to our app's WeatherCondition.
  static WeatherCondition mapWmoCodeToCondition(int code) {
    if (code == 0 || code == 1) return WeatherCondition.clear; // Clear, Mainly clear
    if (code == 2 || code == 3) return WeatherCondition.cloudy; // Partly cloudy, Overcast
    if (code >= 45 && code <= 48) return WeatherCondition.cloudy; // Fog
    if (code >= 51 && code <= 67) return WeatherCondition.rainy; // Drizzle, Rain, Freezing Rain
    if (code >= 71 && code <= 77) return WeatherCondition.snowy; // Snow fall, Snow grains
    if (code >= 80 && code <= 82) return WeatherCondition.rainy; // Rain showers
    if (code >= 85 && code <= 86) return WeatherCondition.snowy; // Snow showers
    if (code >= 95 && code <= 99) return WeatherCondition.thunderstorm; // Thunderstorm
    return WeatherCondition.clear; // Default fallback
  }
}

final weatherRepositoryProvider = Provider<IWeatherRepository>((ref) {
  return OpenMeteoWeatherRepository();
});
