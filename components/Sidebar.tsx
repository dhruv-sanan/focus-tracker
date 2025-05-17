"use client"

import Link from "next/link"
import { useState } from "react"
import { BarChart3, Home, Settings, Book, Clock, PenToolIcon as Tool } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import PomodoroTimer from "@/components/pomodoro-timer"

export default function Sidebar() {
  const [showTimer, setShowTimer] = useState(false)

  return (
    <aside className="w-16 border-r h-screen border-border flex flex-col items-center py-6 gap-6">
        
      {/* Pomodoro Clock Button */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center" onClick={() => setShowTimer(true)}>
          <Clock className="h-5 w-5 text-primary-foreground" />
        </Button>
        
      </div>

      <Link href="/">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Home className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/journal">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Book className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/analytics">
        <Button variant="ghost" size="icon" className="rounded-full">
          <BarChart3 className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/tools">
        <Button
          size="icon"
          className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
        >
          <Tool className="h-5 w-5 text-primary-foreground" />
        </Button>
      </Link>

      <div className="mt-auto flex flex-col gap-4">
        <ThemeToggle />
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Timer Modal */}
      <PomodoroTimer isOpen={showTimer} onClose={() => setShowTimer(false)} />
    </aside>
  )
}
