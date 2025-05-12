"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function ThemePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  // This avoids hydration mismatch errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Theme Settings</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Color Theme</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                  System
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => (window.location.href = "/")} className="w-full sm:w-auto">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
