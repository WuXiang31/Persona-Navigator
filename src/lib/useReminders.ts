"use client";

import { useEffect, useState } from "react";
import { createLocalStore, useIsClient, useLocalStore } from "./localStore";
import { DEFAULT_REMINDER_HOUR } from "./reminders";
import { currentLang } from "./i18n";

// The hour this device reminds at; per device, like the push subscription itself
const hourStore = createLocalStore<number>("persona_reminder_hour", DEFAULT_REMINDER_HOUR);

export type ReminderSupport = "ok" | "unsupported" | "ios-install";

function detectSupport(): ReminderSupport {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  // iOS only offers Web Push to apps added to the home screen
  if (ios && !standalone) return "ios-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  return "ok";
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

async function saveSubscription(sub: PushSubscription, hour: number) {
  const res = await fetch("/api/push", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: sub.toJSON(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour,
      lang: currentLang(),
    }),
  });
  if (!res.ok) throw new Error(`Saving the subscription failed: ${res.status}`);
}

// Turns this device's daily reminder on or off and changes its hour
export function useReminders() {
  const isClient = useIsClient();
  const hour = useLocalStore(hourStore);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const support: ReminderSupport | null = isClient ? detectSupport() : null;

  // Find out whether this device already has reminders on
  useEffect(() => {
    if (support !== "ok") return;
    let cancelled = false;
    (async () => {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      if (cancelled) return;
      setSubscription(sub);
      setPermission(Notification.permission);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [support]);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(false);
    try {
      await task();
    } catch (e) {
      console.warn("Reminder change failed:", e);
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  // Must be called from a tap: browsers only show the permission prompt for a user gesture
  const enable = () =>
    run(async () => {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
      const reg = await registration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        }));
      await saveSubscription(sub, hour);
      setSubscription(sub);
    });

  const disable = () =>
    run(async () => {
      if (!subscription) return;
      await fetch("/api/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      setSubscription(null);
    });

  const changeHour = (next: number) => {
    hourStore.set(next);
    if (subscription) run(() => saveSubscription(subscription, next));
  };

  const sendTest = () =>
    run(async () => {
      if (!subscription) return;
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!res.ok) throw new Error(`Test failed: ${res.status}`);
    });

  return { support, permission, enabled: !!subscription, hour, busy, error, enable, disable, changeHour, sendTest };
}

// On sign-out, stop this device's reminders for the previous account; the server drops the
// subscription the next time a send to it fails
export async function dropDeviceReminder() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
}
