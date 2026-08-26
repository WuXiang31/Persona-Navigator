import type { Metadata } from "next";
import { Anybody, Outfit } from "next/font/google";
import "./globals.css";

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
      <body className="antialias">{children}</body>
    </html>
  );
}
