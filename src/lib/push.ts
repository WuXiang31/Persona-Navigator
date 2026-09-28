import webpush from "web-push";

// Push services use this to contact the sender about problems
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "https://persona-navigator.vercel.app";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(VAPID_SUBJECT, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  configured = true;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type PushResult = "sent" | "gone" | "failed";

// Sends one notification. "gone" means the browser dropped the subscription and it should be deleted.
export async function sendPush(
  sub: StoredSubscription,
  payload: { title: string; body: string; url: string }
): Promise<PushResult> {
  configure();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 3 }
    );
    return "sent";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "gone";
    console.error("Push failed:", status, (error as Error).message);
    return "failed";
  }
}
