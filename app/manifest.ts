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
        src: "/icon/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", 
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", 
      },
    ],
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "health"],
    screenshots: [
      {
        src: "/screenshots/mobile-home.png",
        sizes: "1170x2532",
        type: "image/png",
      },
      {
        src: "/screenshots/mobile-summary.png",
        sizes: "939x1552",
        type: "image/png",
      },    
      {
        "src": "/screenshots/home.png",
        "sizes": "1920x1080",
        "type": "image/png",
        "form_factor": "wide"
      }
    ],
    prefer_related_applications: false,
  }
}
