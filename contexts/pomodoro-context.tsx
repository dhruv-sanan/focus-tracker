"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"

type TimerStatus = "idle" | "work" | "shortBreak" | "longBreak"

interface PomodoroSettings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  sessionsBeforeLongBreak: number
}

interface PomodoroContextType {
  status: TimerStatus
  timeRemaining: number // in seconds
  currentSession: number
  totalSessions: number
  settings: PomodoroSettings
  isActive: boolean
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipToNext: () => void
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void
  progress: number // 0 to 1
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [timeRemaining, setTimeRemaining] = useState(defaultSettings.workDuration * 60)
  const [isActive, setIsActive] = useState(false)
  const [currentSession, setCurrentSession] = useState(1)
  const [totalSessions, setTotalSessions] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [progress, setProgress] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const workAudioRef = useRef<HTMLAudioElement | null>(null)
  const breakAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== "undefined") {
      workAudioRef.current = new Audio("/sounds/work-start.mp3")
      breakAudioRef.current = new Audio("/sounds/break-start.mp3")
    }

    // Load saved state from localStorage
    const savedState = localStorage.getItem("pomodoroState")
    const savedSettings = localStorage.getItem("pomodoroSettings")

    if (savedState) {
      const state = JSON.parse(savedState)
      setStatus(state.status)
      setTimeRemaining(state.timeRemaining)
      setIsActive(state.isActive)
      setCurrentSession(state.currentSession)
      setTotalSessions(state.totalSessions)
      setProgress(state.progress)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    const state = {
      status,
      timeRemaining,
      isActive,
      currentSession,
      totalSessions,
      progress,
    }

    localStorage.setItem("pomodoroState", JSON.stringify(state))
  }, [status, timeRemaining, isActive, currentSession, totalSessions, progress])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
  }, [settings])

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }

          // Calculate progress
          let totalTime
          switch (status) {
            case "work":
              totalTime = settings.workDuration * 60
              break
            case "shortBreak":
              totalTime = settings.shortBreakDuration * 60
              break
            case "longBreak":
              totalTime = settings.longBreakDuration * 60
              break
            default:
              totalTime = settings.workDuration * 60
          }

          const newProgress = 1 - (prev - 1) / totalTime
          setProgress(newProgress)

          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, status, settings])

  const handleTimerComplete = () => {
    // Play sound based on current status
    if (status === "work") {
      breakAudioRef.current?.play()

      // Determine if it's time for a long break
      if (currentSession % settings.sessionsBeforeLongBreak === 0) {
        setStatus("longBreak")
        setTimeRemaining(settings.longBreakDuration * 60)
      } else {
        setStatus("shortBreak")
        setTimeRemaining(settings.shortBreakDuration * 60)
      }
    } else {
      workAudioRef.current?.play()
      setStatus("work")
      setTimeRemaining(settings.workDuration * 60)

      if (status === "shortBreak" || status === "longBreak") {
        setCurrentSession((prev) => prev + 1)
        setTotalSessions((prev) => prev + 1)
      }
    }

    // Reset progress for the new timer
    setProgress(0)
  }

  const startTimer = () => {
    if (status === "idle") {
      setStatus("work")
      setTimeRemaining(settings.workDuration * 60)
      workAudioRef.current?.play()
    }
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setStatus("idle")
    setTimeRemaining(settings.workDuration * 60)
    setCurrentSession(1)
    setProgress(0)
  }

  const skipToNext = () => {
    if (status === "work") {
      if (currentSession % settings.sessionsBeforeLongBreak === 0) {
        setStatus("longBreak")
        setTimeRemaining(settings.longBreakDuration * 60)
      } else {
        setStatus("shortBreak")
        setTimeRemaining(settings.shortBreakDuration * 60)
      }
      breakAudioRef.current?.play()
    } else {
      setStatus("work")
      setTimeRemaining(settings.workDuration * 60)

      if (status === "shortBreak" || status === "longBreak") {
        setCurrentSession((prev) => prev + 1)
        setTotalSessions((prev) => prev + 1)
      }
      workAudioRef.current?.play()
    }
    setProgress(0)
  }

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))

    // If timer is not active, update the current time remaining based on the new settings
    if (!isActive || status === "idle") {
      if (status === "work" || status === "idle") {
        setTimeRemaining((newSettings.workDuration || settings.workDuration) * 60)
      } else if (status === "shortBreak") {
        setTimeRemaining((newSettings.shortBreakDuration || settings.shortBreakDuration) * 60)
      } else if (status === "longBreak") {
        setTimeRemaining((newSettings.longBreakDuration || settings.longBreakDuration) * 60)
      }
    }
  }

  return (
    <PomodoroContext.Provider
      value={{
        status,
        timeRemaining,
        currentSession,
        totalSessions,
        settings,
        isActive,
        startTimer,
        pauseTimer,
        resetTimer,
        skipToNext,
        updateSettings,
        progress,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}
