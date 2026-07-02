import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../models/weather_condition.dart';
import '../repositories/weather_repository.dart';

abstract class IWeatherService {
  Future<WeatherCondition> getLocalWeather();
}

class PersonaWeatherService implements IWeatherService {
  final IWeatherRepository _repository;

  PersonaWeatherService(this._repository);

  @override
  Future<WeatherCondition> getLocalWeather() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled. Return default fallback.
      return WeatherCondition.clear;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied, next time you could try
        // requesting permissions again.
        return WeatherCondition.clear;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately. 
      return WeatherCondition.clear;
    } 

    // When we reach here, permissions are granted and we can
    // continue accessing the position of the device.
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.low, 
        timeLimit: const Duration(seconds: 5),
      );
      
      return await _repository.getCurrentWeather(position.latitude, position.longitude);
    } catch (e) {
      // Timeout or other error
      return WeatherCondition.clear;
    }
  }
}

final weatherServiceProvider = Provider<IWeatherService>((ref) {
  final repo = ref.read(weatherRepositoryProvider);
  return PersonaWeatherService(repo);
});
