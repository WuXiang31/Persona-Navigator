// Game state that follows the account. The weather cache stays per device.
export const SYNCED_KEYS = [
  "persona_role",
  "persona_stats",
  "persona_decay",
  "persona_missions",
  "persona_chat",
  "persona_profile",
  "persona_mask",
  "persona_log",
  "persona_chapter",
  "persona_recaps",
] as const;

export type SyncedKey = (typeof SYNCED_KEYS)[number];
export type SyncedEntries = Partial<Record<SyncedKey, string>>;

// localStorage key naming the Clerk user the local game state belongs to
export const OWNER_KEY = "persona_owner";

// Per-key cap on stored values, well above a full chat history
export const MAX_VALUE_LENGTH = 200_000;

export function isSyncedKey(key: string): key is SyncedKey {
  return (SYNCED_KEYS as readonly string[]).includes(key);
}

export type HydrationPlan =
  // The account already has cloud data: replace local state with it
  | { action: "use-server"; entries: SyncedEntries }
  // First sign-in with this browser's existing progress: upload it to the account
  | { action: "import-local"; entries: SyncedEntries }
  // Nothing to keep (new account, or local data belongs to someone else): start empty
  | { action: "start-fresh" };

// Decides how to reconcile this browser's localStorage with the account's cloud data on sign-in.
// `owner` is null for data saved before accounts existed, which is treated as the new user's own.
export function planHydration(
  userId: string,
  server: SyncedEntries,
  local: SyncedEntries,
  owner: string | null
): HydrationPlan {
  if (Object.keys(server).length > 0) return { action: "use-server", entries: server };

  const localIsTheirs = owner === null || owner === userId;
  if (localIsTheirs && Object.keys(local).length > 0) return { action: "import-local", entries: local };

  return { action: "start-fresh" };
}
