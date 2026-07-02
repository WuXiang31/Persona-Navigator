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
        return 'BONUS: CHARM+';
      case WeatherCondition.cloudy:
        return 'BONUS: PROFICIENCY+';
      case WeatherCondition.rainy:
        return 'BONUS: KNOWLEDGE+';
      case WeatherCondition.snowy:
        return 'BONUS: GUTS+';
      case WeatherCondition.thunderstorm:
        return 'BONUS: ALL+';
    }
  }
}
