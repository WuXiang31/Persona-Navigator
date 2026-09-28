import type { MetadataRoute } from "next";

// Lets the app be installed to a home screen; iPhone needs this for push reminders
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Persona Navigator",
    short_name: "Navigator",
    description: "A real-life RPG: level up your stats by clearing real missions.",
    start_url: "/home",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#E50000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
