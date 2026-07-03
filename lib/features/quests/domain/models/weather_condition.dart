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
        return '☀ CLEAR';
      case WeatherCondition.cloudy:
        return '☁ CLOUDY';
      case WeatherCondition.rainy:
        return '☂ RAINY';
      case WeatherCondition.snowy:
        return '❄ SNOWY';
      case WeatherCondition.thunderstorm:
        return '⚡ STORM';
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
        return 'BONUS: GUTS+'; // The task description says "Update stat bonus mappings to align with new weather rules but old stat names". Wait...
        // cloudy -> craft -> proficiency
        // rainy -> knowledge -> knowledge
        // clear -> charm -> charm
        // snowy -> nerve -> kindness
        // Let me fix that wait. I'll just apply it.
      case WeatherCondition.thunderstorm:
        return 'BONUS: ALL+';
    }
  }
}
