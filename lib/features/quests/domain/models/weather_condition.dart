enum WeatherCondition {
  clear,
  cloudy,
  rainy,
  snowy,
  thunderstorm,
}

extension WeatherConditionExtension on WeatherCondition {
  String get displayName {
    switch (this) {
      case WeatherCondition.clear:
        return 'CLEAR';
      case WeatherCondition.cloudy:
        return 'CLOUDY';
      case WeatherCondition.rainy:
        return 'RAINY';
      case WeatherCondition.snowy:
        return 'SNOWY';
      case WeatherCondition.thunderstorm:
        return 'STORM';
    }
  }

  /// P5-style stat bonuses for weather
  String get statBonusDisplay {
    switch (this) {
      case WeatherCondition.clear:
        return 'TODAY\'S BONUS: CHARM ×1.5';
      case WeatherCondition.cloudy:
        return 'TODAY\'S BONUS: PROFICIENCY ×1.5';
      case WeatherCondition.rainy:
        return 'TODAY\'S BONUS: KNOWLEDGE ×1.5';
      case WeatherCondition.snowy:
        return 'TODAY\'S BONUS: GUTS ×1.5';
      case WeatherCondition.thunderstorm:
        return 'TODAY\'S BONUS: ALL ×1.5';
    }
  }
}
