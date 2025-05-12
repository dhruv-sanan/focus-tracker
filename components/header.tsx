"use client"

import Link from "next/link"
import { Settings, BarChart2, Menu } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")

  return (
    <header className="flex justify-between items-center w-full">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">MyFocusDash</h1>

      {isMobile ? (
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
              <Link
                href="/summary"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Weekly Summary
                </div>
              </Link>
              <Link
                href="/theme"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Theme Settings
                </div>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/summary"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-md transition-colors"
            title="Weekly Summary"
          >
            <BarChart2 className="h-5 w-5" />
          </Link>
          <Link
            href="/theme"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-md transition-colors"
            title="Theme Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      )}
    </header>
  )
}
