import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next" // Import Viewport type
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"] })

// Define core metadata (excluding viewport-specific items)
export const metadata: Metadata = {
  title: "MyFocusDash - Personalized Schedule App",
  description: "A personalized, time-aware daily schedule app designed for ADHD users",
  manifest: "/manifest.json", // Keep manifest here
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFocusDash",
    // Consider adding startup images here if needed
  },
  formatDetection: {
    telephone: false,
  },
  generator: 'v0.dev', // Keep generator or other metadata here
  // icons: { // Recommended way for icons instead of <link> in <head>
  //   apple: '/icons/icon-192x192.png',
  // },
}

// Define viewport-specific settings using generateViewport
export function generateViewport(): Viewport {
  return {
    themeColor: "#14b8a6", // Moved here
    width: 'device-width', // Part of viewport moved here
    initialScale: 1,       // Part of viewport moved here
    maximumScale: 1,       // Part of viewport moved here
    userScalable: false,   // Part of viewport moved here (user-scalable=no)
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Recommended to move icons to metadata object, but keeping for now if you have specific reasons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" /> {/* This is handled by metadata.appleWebApp.capable */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" /> {/* Handled by metadata.appleWebApp.statusBarStyle */}
        {/* Consider removing the above meta tags if relying solely on the metadata object */}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}