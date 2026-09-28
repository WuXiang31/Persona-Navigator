import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { userState } from "@/db/schema";
import { MAX_VALUE_LENGTH, SyncedEntries, isSyncedKey } from "@/lib/cloudSync";

// GET: every synced value saved for the signed-in user, as { entries: { key: rawValue } }
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const rows = await db
    .select({ key: userState.key, value: userState.value })
    .from(userState)
    .where(eq(userState.userId, userId));

  const entries: SyncedEntries = {};
  for (const row of rows) if (isSyncedKey(row.key)) entries[row.key] = row.value;
  return NextResponse.json({ entries });
}

// PUT { changes: { key: rawValue | null } }: upserts values and deletes keys set to null
export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const changes = (body as { changes?: unknown })?.changes;
  if (!changes || typeof changes !== "object") {
    return NextResponse.json({ error: "Expected { changes }" }, { status: 400 });
  }

  const upserts: { userId: string; key: string; value: string; updatedAt: Date }[] = [];
  const deletes: string[] = [];
  for (const [key, value] of Object.entries(changes)) {
    if (!isSyncedKey(key)) return NextResponse.json({ error: `Unknown key: ${key}` }, { status: 400 });
    if (value === null) {
      deletes.push(key);
    } else if (typeof value === "string" && value.length <= MAX_VALUE_LENGTH) {
      upserts.push({ userId, key, value, updatedAt: new Date() });
    } else {
      return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
    }
  }

  await db.transaction(async (tx) => {
    for (const row of upserts) {
      await tx
        .insert(userState)
        .values(row)
        .onConflictDoUpdate({
          target: [userState.userId, userState.key],
          set: { value: row.value, updatedAt: row.updatedAt },
        });
    }
    if (deletes.length > 0) {
      await tx.delete(userState).where(and(eq(userState.userId, userId), inArray(userState.key, deletes)));
    }
  });

  return NextResponse.json({ ok: true });
}
