"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if the app is already installed
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    // Check if the device is iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show the install button
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if the user has already dismissed the prompt
    const hasUserDismissedPrompt = localStorage.getItem("pwaPromptDismissed")
    if (hasUserDismissedPrompt === "true") {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice

    // Reset the deferredPrompt variable
    setDeferredPrompt(null)
    setShowPrompt(false)

    // Track the outcome
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
      localStorage.setItem("pwaPromptDismissed", "true")
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwaPromptDismissed", "true")
  }

  // Don't show if already installed or no prompt available (except for iOS)
  if (isStandalone || (!showPrompt && !isIOS)) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Install MyFocusDash</h3>
          {isIOS ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tap <span className="inline-block">{"Share"}</span> and then {"Add to Home Screen"} to install
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">Install this app on your device for quick access</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button onClick={handleInstallClick} size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Install
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
