import Cocoa
import FlutterMacOS
import EventKit

@main
class AppDelegate: FlutterAppDelegate {
  override func applicationDidFinishLaunching(_ notification: Notification) {
    let controller = mainFlutterWindow?.contentViewController as! FlutterViewController
    let calendarChannel = FlutterMethodChannel(name: "com.persona.navigator/calendar",
                                               binaryMessenger: controller.engine.binaryMessenger)
    
    calendarChannel.setMethodCallHandler({
      (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
      if call.method == "getTodayEvents" {
        self.fetchCalendarEvents(result: result)
      } else {
        result(FlutterMethodNotImplemented)
      }
    })
    super.applicationDidFinishLaunching(notification)
  }

  private func fetchCalendarEvents(result: @escaping FlutterResult) {
    let eventStore = EKEventStore()
    
    if #available(macOS 14.0, *) {
      eventStore.requestFullAccessToEvents { (granted, error) in
        self.handleCalendarAccess(granted: granted, error: error, eventStore: eventStore, result: result)
      }
    } else {
      eventStore.requestAccess(to: .event) { (granted, error) in
        self.handleCalendarAccess(granted: granted, error: error, eventStore: eventStore, result: result)
      }
    }
  }
  
  private func handleCalendarAccess(granted: Bool, error: Error?, eventStore: EKEventStore, result: @escaping FlutterResult) {
    if granted {
      let calendars = eventStore.calendars(for: .event)
      let now = Date()
      let startOfDay = Calendar.current.startOfDay(for: now)
      var components = DateComponents()
      components.day = 1
      components.second = -1
      let endOfDay = Calendar.current.date(byAdding: components, to: startOfDay)!
      
      let predicate = eventStore.predicateForEvents(withStart: startOfDay, end: endOfDay, calendars: calendars)
      let events = eventStore.events(matching: predicate)
      
      let formatter = ISO8601DateFormatter()
      let eventsArray = events.map { event -> [String: Any] in
        return [
          "title": event.title ?? "Unknown Event",
          "startTime": formatter.string(from: event.startDate),
          "endTime": formatter.string(from: event.endDate)
        ]
      }
      result(eventsArray)
    } else {
      let errorMsg = error?.localizedDescription ?? "Unknown error"
      print("Calendar Request Error: \(errorMsg)")
      result(FlutterError(code: "UNAVAILABLE",
                          message: "Calendar access denied: \(errorMsg)",
                          details: nil))
    }
  }

  override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    return true
  }

  override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }
}
