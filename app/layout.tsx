import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import Sidebar from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

// Define core metadata (excluding viewport-specific items)
export const metadata: Metadata = {
  title: "MyFocusDash - Personalized Schedule App",
  description: "A personalized, time-aware daily schedule app designed for ADHD users",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFocusDash",
  },
  formatDetection: {
    telephone: false,
  },
  generator: 'v0.dev',
}

// Viewport settings
export function generateViewport(): Viewport {
  return {
    themeColor: "#14b8a6",
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex">
            {/* Fixed Sidebar */}
            <div className="fixed top-0 left-0 h-screen w-16 border-r border-border flex flex-col justify-between py-6 z-50 bg-background">
              <Sidebar />
            </div>

            {/* Main content with left padding */}
            <main className="ml-16 flex-1 min-h-screen">
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </main>
          </div>
          {/* Global components */}
          <Toaster />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
