import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Convida — Convites online e RSVP",
    short_name: "Convida",
    description:
      "Crie convites online, envie convites digitais e acompanhe a confirmação de presença (RSVP) em tempo real.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafeff",
    theme_color: "#06acc6",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
