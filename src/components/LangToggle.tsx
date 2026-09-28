"use client";

import { setLang, useLang, useT } from "@/lib/i18n";
import styles from "./LangToggle.module.css";

// Switches the UI between English and Chinese; the label names the language it switches to
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  return (
    <button
      className={`${styles.toggle} ${className}`}
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
    >
      {t.langToggle}
    </button>
  );
}
