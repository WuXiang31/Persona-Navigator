import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/calendar_event.dart';

abstract class ICalendarRepository {
  Future<List<CalendarEvent>> getTodayEvents();
}

class NativeCalendarRepository implements ICalendarRepository {
  static const MethodChannel _channel = MethodChannel('com.persona.navigator/calendar');

  @override
  Future<List<CalendarEvent>> getTodayEvents() async {
    try {
      final List<dynamic>? result = await _channel.invokeListMethod<dynamic>('getTodayEvents');
      if (result == null) return [];

      return result.map((e) {
        final map = Map<String, dynamic>.from(e as Map);
        return CalendarEvent.fromMap(map);
      }).toList();
    } on PlatformException catch (e) {
      print('Failed to get calendar events: ${e.message}');
      return [];
    } catch (e) {
      // MissingPluginException on iOS where the channel isn't implemented
      print('Calendar not available on this platform: $e');
      return [];
    }
  }
}

final calendarRepositoryProvider = Provider<ICalendarRepository>((ref) {
  return NativeCalendarRepository();
});
