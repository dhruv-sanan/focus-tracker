import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyFocusDash - Personalized Schedule App",
    short_name: "MyFocusDash",
    description: "A personalized schedule app designed for ADHD users",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#14b8a6",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "health"],
    screenshots: [
      {
        src: "/screenshots/mobile-home.png",
        sizes: "1170x2532",
        type: "image/png",
        platform: "narrow",
        label: "Home Screen of MyFocusDash",
      },
      {
        src: "/screenshots/mobile-summary.png",
        sizes: "1170x2532",
        type: "image/png",
        platform: "narrow",
        label: "Summary Screen of MyFocusDash",
      },
    ],
    prefer_related_applications: false,
  }
}
