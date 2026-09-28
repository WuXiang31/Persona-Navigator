import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { MESSAGES } from "@/lib/messages";
import { isValidTimeZone, sanitizeHour } from "@/lib/reminders";
import { sendPush } from "@/lib/push";

const lang = (value: unknown) => (value === "zh" ? "zh" : "en");

function readSubscription(raw: unknown) {
  const sub = raw as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const authKey = sub?.keys?.auth;
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) return null;
  if (typeof p256dh !== "string" || typeof authKey !== "string") return null;
  return { endpoint, p256dh, auth: authKey };
}

// PUT { subscription, timeZone, hour, lang }: turn reminders on for this device, or update its settings
export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const sub = readSubscription(body?.subscription);
  if (!sub || !isValidTimeZone(body?.timeZone)) {
    return NextResponse.json({ error: "A push subscription and time zone are required" }, { status: 400 });
  }
  const values = { ...sub, userId, timeZone: body.timeZone, hour: sanitizeHour(body.hour), lang: lang(body.lang) };

  await db
    .insert(pushSubscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      // Changing the hour may make today's reminder due again
      set: { ...values, lastSentDay: null },
    });
  return NextResponse.json({ ok: true });
}

// DELETE { endpoint }: turn reminders off for this device
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, body.endpoint), eq(pushSubscriptions.userId, userId)));
  return NextResponse.json({ ok: true });
}

// POST { endpoint }: send a test notification to one of the user's devices
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  const [sub] = await db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, body.endpoint), eq(pushSubscriptions.userId, userId)));
  if (!sub) return NextResponse.json({ error: "Reminders are not on for this device" }, { status: 404 });

  const t = MESSAGES[lang(sub.lang)].reminder;
  const result = await sendPush(sub, { title: t.testTitle, body: t.testBody, url: "/home" });
  if (result === "gone") await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
  return NextResponse.json({ result }, { status: result === "sent" ? 200 : 502 });
}
