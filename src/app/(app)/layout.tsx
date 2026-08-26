"use client";

import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ paddingBottom: "80px", minHeight: "100vh", position: "relative" }}>
      {children}
      <BottomNav />
    </div>
  );
}
