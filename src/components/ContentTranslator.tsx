"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/context/ProfileContext";
import { useMissions } from "@/context/MissionContext";
import { useToast } from "@/context/ToastContext";
import { createLocalStore, useLocalStore } from "@/lib/localStore";
import { Lang, messages, useLang } from "@/lib/i18n";
import {
  ContentLangState,
  collectTexts,
  nextContentLangState,
  pairTranslations,
  restorable,
} from "@/lib/contentTranslation";

// The language the account's mask and missions were last translated into, and what they replaced (synced)
const contentLangStore = createLocalStore<ContentLangState | null>("persona_content_lang", null);

// When the UI language changes, translates the mask and active missions the AI (or the player)
// wrote in the other language, once. Text added later in either language is left alone.
export function ContentTranslator() {
  const { isSignedIn } = useAuth();
  const lang = useLang();
  const contentLang = useLocalStore(contentLangStore)?.lang ?? null;
  const { mask, hasPersonalMask, translateMask, isLoaded } = useProfile();
  const { missions, translateMissions } = useMissions();
  const { showToast } = useToast();
  const inFlight = useRef<Lang | null>(null);

  useEffect(() => {
    if (!isSignedIn || !isLoaded || contentLang === lang || inFlight.current === lang) return;
    const texts = collectTexts(hasPersonalMask ? mask : null, missions, lang);
    if (texts.length === 0) {
      contentLangStore.set({ lang, originals: {} });
      return;
    }
    // Text an earlier translation produced goes back to its original; only the rest needs the AI
    const { known, missing } = restorable(texts, contentLangStore.get());

    inFlight.current = lang;
    (async () => {
      const map = new Map(known);
      if (missing.length > 0) {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: missing, lang }),
        });
        if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
        const translated = pairTranslations(missing, (await res.json()).translations);
        if (!translated) throw new Error("Translate returned a mismatched list");
        translated.forEach((to, from) => map.set(from, to));
      }
      // The player may have switched back while this was running
      if (inFlight.current !== lang) return;
      translateMask(map);
      translateMissions(map);
      contentLangStore.set(nextContentLangState(lang, map));
      showToast(messages().toast.translated, "info");
    })()
      // Tried again on the next visit
      .catch((e) => console.warn("Content translation failed:", e))
      .finally(() => {
        if (inFlight.current === lang) inFlight.current = null;
      });
    // Runs when the language changes, not on every mission edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, lang, contentLang]);

  return null;
}
