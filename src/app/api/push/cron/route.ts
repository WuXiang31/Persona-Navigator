import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, userState } from "@/db/schema";
import { MESSAGES } from "@/lib/messages";
import { isReminderDue, playedOn } from "@/lib/reminders";
import { sendPush } from "@/lib/push";

// Called hourly by Vercel Cron (24 daily jobs in vercel.json, since Hobby allows once a day per job).
// Sends each device its reminder once its local hour arrives, unless the player already
// cleared a mission today.
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = (await db.select().from(pushSubscriptions))
    .map((sub) => ({ sub, ...isReminderDue(sub, now) }))
    .filter((d) => d.due);
  if (due.length === 0) return NextResponse.json({ due: 0 });

  // Each player's XP log and mask, to skip players who already played and to name the mask
  const userIds = [...new Set(due.map((d) => d.sub.userId))];
  const rows = await db
    .select()
    .from(userState)
    .where(and(inArray(userState.userId, userIds), inArray(userState.key, ["persona_log", "persona_mask"])));
  const state = (userId: string, key: string) => rows.find((r) => r.userId === userId && r.key === key)?.value;

  const counts = { sent: 0, skipped: 0, gone: 0, failed: 0 };
  for (const { sub, day } of due) {
    if (playedOn(state(sub.userId, "persona_log"), sub.timeZone, day)) {
      counts.skipped++;
    } else {
      let maskName: string | null = null;
      try {
        maskName = JSON.parse(state(sub.userId, "persona_mask") ?? "null")?.name ?? null;
      } catch {}
      const t = MESSAGES[sub.lang === "zh" ? "zh" : "en"].reminder;
      const result = await sendPush(sub, { title: t.notifyTitle(maskName), body: t.notifyBody(maskName), url: "/missions" });
      counts[result]++;
      if (result === "gone") {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
        continue;
      }
      // A failed send is retried next hour, within the window
      if (result === "failed") continue;
    }
    await db.update(pushSubscriptions).set({ lastSentDay: day }).where(eq(pushSubscriptions.endpoint, sub.endpoint));
  }
  return NextResponse.json({ due: due.length, ...counts });
}
