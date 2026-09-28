import { createLocalStore, useIsClient, useLocalStore } from "./localStore";
import { Lang, MESSAGES, Messages } from "./messages";

export { MESSAGES } from "./messages";
export type { Lang, Messages } from "./messages";

// null = follow the device language
const langStore = createLocalStore<Lang | null>("persona_lang", null);

function deviceLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.languages?.some((l) => l.toLowerCase().startsWith("zh")) ? "zh" : "en";
}

export function currentLang(): Lang {
  return langStore.get() ?? deviceLang();
}

export function setLang(lang: Lang) {
  langStore.set(lang);
}

// Copy for the current language, for code outside React render (effects, callbacks)
export function messages(): Messages {
  return MESSAGES[currentLang()];
}

export function useLang(): Lang {
  const stored = useLocalStore(langStore);
  // Server render and hydration see no stored value and no device, so they use English;
  // the device language applies right after hydration
  const isClient = useIsClient();
  return stored ?? (isClient ? deviceLang() : "en");
}

export function useT(): Messages {
  return MESSAGES[useLang()];
}
