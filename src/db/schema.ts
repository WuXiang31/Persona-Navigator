import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// One row per synced localStorage key per user. `value` is the raw stored string,
// so each store's own codec (JSON, or the bare role string) round-trips unchanged.
export const userState = pgTable(
  "user_state",
  {
    userId: text("user_id").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })]
);

// One row per device that turned on daily reminders (a Web Push subscription)
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    endpoint: text("endpoint").primaryKey(),
    userId: text("user_id").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    // IANA time zone of the device, e.g. "Australia/Melbourne"
    timeZone: text("time_zone").notNull(),
    // Local hour (0-23) to send the reminder
    hour: integer("hour").notNull().default(20),
    lang: text("lang").notNull().default("en"),
    // Local day ("YYYY-MM-DD") the reminder was last handled, so it goes out at most once a day
    lastSentDay: text("last_sent_day"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)]
);
