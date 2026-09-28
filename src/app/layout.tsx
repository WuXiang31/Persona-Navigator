import type { Metadata } from "next";
import { Anybody, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";
import { MissionProvider } from "@/context/MissionContext";
import { ToastProvider } from "@/context/ToastContext";
import { CloudSyncProvider } from "@/context/CloudSyncContext";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic", "normal"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Match Clerk's sign-in, sign-up and account screens to the red/black/white theme
const clerkAppearance = {
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

export const metadata: Metadata = {
  title: "Persona Navigator",
  description: "A stylish real-life RPG stat growth tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anybody.variable} ${outfit.variable}`}>
      <body className="antialias">
        <ClerkProvider
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          // New accounts awaken their mask first; returning players go straight to Status
          signUpFallbackRedirectUrl="/awakening"
          signInFallbackRedirectUrl="/home"
          afterSignOutUrl="/"
        >
          <ToastProvider>
            {/* Loads the account's saved game before the providers below read it */}
            <CloudSyncProvider>
              <ProfileProvider>
                <MissionProvider>{children}</MissionProvider>
              </ProfileProvider>
            </CloudSyncProvider>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
