class CalendarEvent {
  final String title;
  final DateTime startTime;
  final DateTime endTime;

  CalendarEvent({
    required this.title,
    required this.startTime,
    required this.endTime,
  });

  factory CalendarEvent.fromMap(Map<String, dynamic> map) {
    return CalendarEvent(
      title: map['title'] as String,
      startTime: DateTime.parse(map['startTime'] as String),
      endTime: DateTime.parse(map['endTime'] as String),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
    };
  }
}
