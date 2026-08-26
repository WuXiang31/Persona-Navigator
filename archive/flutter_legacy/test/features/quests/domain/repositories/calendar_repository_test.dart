import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:persona_navigator/features/quests/domain/models/calendar_event.dart';
import 'package:persona_navigator/features/quests/domain/repositories/calendar_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const MethodChannel channel = MethodChannel('com.persona.navigator/calendar');
  late NativeCalendarRepository repository;

  setUp(() {
    repository = NativeCalendarRepository();
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(channel, null);
  });

  group('NativeCalendarRepository', () {
    test('getTodayEvents returns a list of CalendarEvent on success', () async {
      // Arrange
      final mockEvents = [
        {
          'title': 'Dentist Appointment',
          'startTime': '2026-07-03T14:00:00Z',
          'endTime': '2026-07-03T15:00:00Z',
        },
        {
          'title': 'Math Exam',
          'startTime': '2026-07-03T09:00:00Z',
          'endTime': '2026-07-03T11:00:00Z',
        }
      ];

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(channel, (MethodCall methodCall) async {
        if (methodCall.method == 'getTodayEvents') {
          return mockEvents;
        }
        return null;
      });

      // Act
      final result = await repository.getTodayEvents();

      // Assert
      expect(result.length, 2);
      expect(result[0].title, 'Dentist Appointment');
      expect(result[1].title, 'Math Exam');
    });

    test('getTodayEvents returns an empty list on PlatformException', () async {
      // Arrange
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(channel, (MethodCall methodCall) async {
        throw PlatformException(code: 'PERMISSION_DENIED', message: 'Access denied');
      });

      // Act
      final result = await repository.getTodayEvents();

      // Assert
      expect(result.isEmpty, true);
    });
  });
}
