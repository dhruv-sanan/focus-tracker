"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Play, Pause, RotateCcw, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
}

export default function PomodoroTimer({ isOpen, onClose }: PomodoroTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [time, setTime] = useState(25 * 60) // Default: 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60)
  const [showSettings, setShowSettings] = useState(false)
  const { theme } = useTheme()
  const { toast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        audioRef.current = new Audio("/notification.mp3")
      }
    } catch (error) {
      console.error("Error initializing audio:", error)
    }

    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      } catch (error) {
        console.error("Error cleaning up audio:", error)
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            try {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
              }
              setIsActive(false)
              setIsPaused(true)

              // Play notification sound
              if (audioRef.current) {
                audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
              }

              // Show notification
              toast({
                title: "Pomodoro completed!",
                description: "Time to take a break.",
              })

              // Request notification permission and show notification
              if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "granted") {
                  try {
                    new Notification("Pomodoro Timer", {
                      body: "Your focus session is complete! Time to take a break.",
                      icon: "/favicon.ico",
                    })
                  } catch (error) {
                    console.error("Error showing notification:", error)
                  }
                } else if (Notification.permission !== "denied") {
                  Notification.requestPermission()
                }
              }
            } catch (error) {
              console.error("Error in timer completion:", error)
            }
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, toast])

  const startTimer = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsPaused(true)
    setTime(initialTime)
  }

  const setPresetTime = (minutes: number) => {
    const seconds = minutes * 60
    setInitialTime(seconds)
    setTime(seconds)
    setShowSettings(false)
  }

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = ((initialTime - time) / initialTime) * 100

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card
        className={cn("w-full max-w-md p-6 shadow-lg", theme === "dark" ? "bg-[#1A2333] border-[#2A3343]" : "bg-white")}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Pomodoro Timer</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={theme === "dark" ? "#2A3343" : "#e2e8f0"}
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transform="rotate(-90 50 50)"
                className="text-primary transition-all duration-1000"
              />
              <text
                x="50"
                y="50"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="currentColor"
                className="text-3xl"
              >
                {formatTime(time)}
              </text>
            </svg>
          </div>

          <div className="flex space-x-4">
            {!isActive || isPaused ? (
              <Button onClick={startTimer} className="bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-2" />
                {isPaused && isActive ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Duration (minutes)</label>
                <div className="flex items-center space-x-4">
                  <Slider
                    defaultValue={[initialTime / 60]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(value) => setPresetTime(value[0])}
                  />
                  <span className="w-12 text-center">{initialTime / 60}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Presets</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={initialTime === 25 * 60 ? "default" : "outline"}
                    onClick={() => setPresetTime(25)}
                    size="sm"
                  >
                    25 min
                  </Button>
                  <Button
                    variant={initialTime === 50 * 60 ? "default" : "outline"}
                    onClick={() => setPresetTime(50)}
                    size="sm"
                  >
                    50 min
                  </Button>
                  <Button
                    variant={initialTime === 5 * 60 ? "default" : "outline"}
                    onClick={() => setPresetTime(5)}
                    size="sm"
                  >
                    5 min (break)
                  </Button>
                  <Button
                    variant={initialTime === 15 * 60 ? "default" : "outline"}
                    onClick={() => setPresetTime(15)}
                    size="sm"
                  >
                    15 min (break)
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button>Save Settings</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
