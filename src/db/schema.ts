import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

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
