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
    try {
      return await Future.microtask(() async {
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          return WeatherCondition.clear;
        }

        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) {
            return WeatherCondition.clear;
          }
        }
        
        if (permission == LocationPermission.deniedForever) {
          return WeatherCondition.clear;
        } 

        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.low, 
          timeLimit: const Duration(seconds: 2),
        );
        
        return await _repository.getCurrentWeather(position.latitude, position.longitude);
      }).timeout(const Duration(seconds: 3));
    } catch (e) {
      // Catch TimeoutException, PlatformException, etc.
      return WeatherCondition.clear;
    }
  }
}

final weatherServiceProvider = Provider<IWeatherService>((ref) {
  final repo = ref.read(weatherRepositoryProvider);
  return PersonaWeatherService(repo);
});
