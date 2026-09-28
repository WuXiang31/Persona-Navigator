"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { onStoreWrite, refreshStores } from "@/lib/localStore";
import { messages } from "@/lib/i18n";
import { dropDeviceReminder } from "@/lib/useReminders";
import { OWNER_KEY, SYNCED_KEYS, SyncedEntries, isSyncedKey, planHydration } from "@/lib/cloudSync";

const PUSH_DELAY_MS = 500;
const RETRY_DELAY_MS = 5000;

type Changes = Record<string, string | null>;

function readLocal(): SyncedEntries {
  const entries: SyncedEntries = {};
  for (const key of SYNCED_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) entries[key] = raw;
  }
  return entries;
}

// Replaces every synced key with `entries`, removing keys it doesn't contain
function writeLocal(entries: SyncedEntries) {
  for (const key of SYNCED_KEYS) {
    const raw = entries[key];
    if (raw === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
  }
}

async function pushChanges(changes: Changes, keepalive = false) {
  const res = await fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes }),
    keepalive,
  });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
}

// Keeps the local game state (localStorage) in step with the signed-in account's cloud copy.
// On sign-in it loads the account's data (or imports this browser's existing progress), and
// renders the app only after that, so no screen ever acts on another account's data.
// Afterwards every local write is pushed to the server shortly after it happens.
export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  // The user whose cloud data is currently loaded into localStorage
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // What the server holds right after loading, to catch writes made before the push listener starts
  const serverSnapshot = useRef<SyncedEntries>({});

  // Load (or import) the account's state whenever the signed-in user changes
  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      // Signed out: drop the previous account's data from this browser.
      // Data saved before accounts existed has no owner and is kept for import.
      if (localStorage.getItem(OWNER_KEY) !== null) {
        writeLocal({});
        localStorage.removeItem(OWNER_KEY);
        refreshStores();
        dropDeviceReminder().catch(() => {});
      }
      return;
    }

    let cancelled = false;
    (async () => {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error(`Load failed: ${res.status}`);
      const { entries } = (await res.json()) as { entries: SyncedEntries };
      if (cancelled) return;

      const plan = planHydration(userId, entries, readLocal(), localStorage.getItem(OWNER_KEY));
      if (plan.action === "use-server") writeLocal(plan.entries);
      else if (plan.action === "import-local") await pushChanges(plan.entries);
      else writeLocal({});
      if (cancelled) return;
      serverSnapshot.current = plan.action === "start-fresh" ? {} : plan.entries;

      localStorage.setItem(OWNER_KEY, userId);
      refreshStores();
      setFailed(false);
      setSyncedFor(userId);
    })().catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, attempt]);

  // Push local writes to the server, batched per key
  const pending = useRef<Changes>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReady = isLoaded && !!userId && syncedFor === userId;

  useEffect(() => {
    if (!isReady) return;

    const flush = (keepalive = false) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      const changes = pending.current;
      if (Object.keys(changes).length === 0) return;
      pending.current = {};

      pushChanges(changes, keepalive).catch(() => {
        // Keep anything written since, then try again later
        pending.current = { ...changes, ...pending.current };
        timer.current = setTimeout(flush, RETRY_DELAY_MS);
      });
    };

    const unsubscribe = onStoreWrite((key) => {
      if (!isSyncedKey(key)) return;
      pending.current[key] = localStorage.getItem(key);
      if (!timer.current) timer.current = setTimeout(flush, PUSH_DELAY_MS);
    });
    // React runs child effects first, so the providers below may already have written on mount
    // (monthly rollover, stat decay) before this listener existed. Push anything that differs
    // from what was just loaded.
    for (const key of SYNCED_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw !== (serverSnapshot.current[key] ?? null)) pending.current[key] = raw;
    }
    if (Object.keys(pending.current).length > 0 && !timer.current) {
      timer.current = setTimeout(flush, PUSH_DELAY_MS);
    }

    // Send unsaved changes before the tab closes or goes to the background
    const onHide = () => flush(true);
    window.addEventListener("pagehide", onHide);
    const onVisibility = () => document.visibilityState === "hidden" && flush(true);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flush(true);
    };
  }, [isReady]);

  if (!isLoaded) return null;
  if (!userId) return <>{children}</>;

  if (failed) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ fontWeight: 800, letterSpacing: 1, marginBottom: 16 }}>{messages().sync.failed}</p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            style={{ background: "var(--color-primary-red)", color: "#fff", padding: "10px 24px", fontWeight: 900 }}
          >
            {messages().sync.retry}
          </button>
        </div>
      </main>
    );
  }

  return isReady ? <>{children}</> : null;
}
