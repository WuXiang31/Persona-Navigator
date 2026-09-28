import type { Metadata } from "next";
import { Anybody, Outfit } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
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
        <AuthProvider>
          <ToastProvider>
            {/* Loads the account's saved game before the providers below read it */}
            <CloudSyncProvider>
              <ProfileProvider>
                <MissionProvider>{children}</MissionProvider>
              </ProfileProvider>
            </CloudSyncProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
