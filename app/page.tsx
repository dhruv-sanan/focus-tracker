"use client"

import { useState, useEffect } from "react"
import DaySelector from "@/components/day-selector"
import TaskList from "@/components/task-list"
import CurrentTimeDisplay from "@/components/current-time-display"
import NowButton from "@/components/now-button"
import Header from "@/components/header"
import { getDayName, getCurrentTask, parseTimeString } from "@/lib/utils"
import scheduleData from "@/data/schedule.json"
import { Button } from "@/components/ui/button"
import { Trash2, Bell, BellOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [selectedDay, setSelectedDay] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotifiedTaskId, setLastNotifiedTaskId] = useState<string | null>(null)
  const { toast } = useToast()

  // --- SERVICE WORKER REGISTRATION ---
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg)
          return navigator.serviceWorker.ready
        })
        .then((readyReg) => {
          console.log("Service Worker active:", readyReg)
        })
        .catch((err) => {
          console.error("SW registration failed:", err)
        })
    }
  }, [])

  // Function to trigger notifications via service worker
  const showTaskNotification = async (title: string, body: string) => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
      })
    }
  }

  // Initialize selected day and completed tasks from localStorage
  useEffect(() => {
    const today = getDayName(new Date())
    setSelectedDay(today)

    const saved = localStorage.getItem("completedTasks")
    if (saved) {
      setCompletedTasks(JSON.parse(saved))
    }

    const notifEnabled = localStorage.getItem("notificationsEnabled") === "true"
    setNotificationsEnabled(notifEnabled)

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))
  }, [completedTasks])

  const [notifiedUpcomingTasks, setNotifiedUpcomingTasks] = useState<{ [taskId: string]: number }>({})

  // Notification logic
  useEffect(() => {
    if (!notificationsEnabled) return

    const today = getDayName(new Date())
    const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
    const currentTask = getCurrentTask(todayTasks, currentTime)

    if (currentTask && currentTask.id !== lastNotifiedTaskId) {
      showTaskNotification("Task Started", `Time to start: ${currentTask.description}`)
      toast({ title: "Task Started", description: currentTask.description })
      setLastNotifiedTaskId(currentTask.id)
    }

    todayTasks.forEach((task) => {
      const taskStartTime = parseTimeString(task.startTime)
      const minsAway = (taskStartTime.getTime() - currentTime.getTime()) / 1000 / 60

      if (minsAway <= 2 && minsAway > 1.99 && notifiedUpcomingTasks[task.id] !== 2) {
        showTaskNotification("Upcoming Task", `In 2 minutes: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 2 minutes: ${task.description}` })
        setNotifiedUpcomingTasks((p) => ({ ...p, [task.id]: 2 }))
      }

      if (minsAway <= 1 && minsAway > 0.99 && notifiedUpcomingTasks[task.id] !== 1) {
        showTaskNotification("Upcoming Task", `In 1 minute: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 1 minute: ${task.description}` })
        setNotifiedUpcomingTasks((p) => ({ ...p, [task.id]: 1 }))
      }
    })
  }, [currentTime, notificationsEnabled, lastNotifiedTaskId, toast, notifiedUpcomingTasks])

  // Midnight reset logic
  useEffect(() => {
    const checkReset = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yName = getDayName(yesterday)
        const archived = JSON.parse(localStorage.getItem("archivedTasks") || "{}")
        const yTasks = scheduleData.schedule[yName as keyof typeof scheduleData.schedule] || []

        const yCompleted: Record<string, boolean> = {}
        yTasks.forEach((t) => {
          if (completedTasks[t.id]) {
            yCompleted[t.id] = true
          }
        })

        archived[yesterday.toISOString().split("T")[0]] = yCompleted
        localStorage.setItem("archivedTasks", JSON.stringify(archived))

        const today = getDayName(now)
        const tTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
        const newCompleted = { ...completedTasks }
        tTasks.forEach((t) => delete newCompleted[t.id])

        setCompletedTasks(newCompleted)
        toast({
          title: "New Day Started",
          description: "Yesterday's tasks have been archived and today's tasks reset.",
        })
      }
    }

    const interval = setInterval(checkReset, 60000)
    return () => clearInterval(interval)
  }, [completedTasks, toast])

  // Handlers and rendering logic unchanged...
  const handleDayChange = (day: string) => setSelectedDay(day)
  const handleNowClick = () => {
    setSelectedDay(getDayName(new Date()))
    setCurrentTime(new Date())
    const el = document.getElementById("current-task")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }
  const handleTaskCompletion = (id: string, done: boolean) =>
    setCompletedTasks((p) => ({ ...p, [id]: done }))

  const dayTasks = scheduleData.schedule[selectedDay as keyof typeof scheduleData.schedule] || []
  const completedCount = dayTasks.filter((t) => completedTasks[t.id]).length
  const pct = dayTasks.length ? (completedCount / dayTasks.length) * 100 : 0

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Header />
          <div className="flex items-center gap-2">
            <CurrentTimeDisplay />
            <NowButton onClick={handleNowClick} />
          </div>
        </div>

        <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {completedCount} of {dayTasks.length} tasks completed
            </div>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <TaskList
            tasks={dayTasks}
            currentTime={currentTime}
            completedTasks={completedTasks}
            onTaskCompletion={handleTaskCompletion}
          />
        </div>
      </div>
    </main>
  )
}
