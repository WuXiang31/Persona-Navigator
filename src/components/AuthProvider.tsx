"use client";

import { useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import { useLang } from "@/lib/i18n";

// Match Clerk's sign-in, sign-up and account screens to the red/black/white theme
const appearance = {
  variables: {
    colorPrimary: "#E50000",
    colorPrimaryForeground: "#F2F2F2",
    colorBackground: "#1E1E1E",
    colorForeground: "#F2F2F2",
    colorMutedForeground: "#888888",
    colorInput: "#262626",
    colorInputForeground: "#F2F2F2",
    colorNeutral: "#F2F2F2",
    borderRadius: "0px",
    fontFamily: "var(--font-outfit)",
  },
};

// ClerkProvider in a client component, so its screens follow the UI language
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  return (
    <ClerkProvider
      appearance={appearance}
      localization={lang === "zh" ? zhCN : undefined}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // New accounts awaken their mask first; returning players go straight to Status
      signUpFallbackRedirectUrl="/awakening"
      signInFallbackRedirectUrl="/home"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
