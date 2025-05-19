"use client"

import { useState, useEffect, useRef } from "react"
import DaySelector from "@/components/day-selector"
import TaskList from "@/components/task-list"
import CurrentTimeDisplay from "@/components/current-time-display"
import NowButton from "@/components/now-button"
import { getDayName, getCurrentTask, parseTimeString } from "@/lib/utils"
import scheduleData from "@/data/schedule.json"
import { useToast } from "@/components/ui/use-toast"
import TodoPopup from "@/components/to-do-list"

export default function Home() {
  const [selectedDay, setSelectedDay] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  // Initialize lastNotifiedTaskId from localStorage or null
  const [lastNotifiedTaskId, setLastNotifiedTaskId] = useState<string | null>(null)
  const { toast } = useToast()
  const [showTimer, setShowTimer] = useState(false) // Assuming this state is used elsewhere
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
    useEffect(() => {
      audioRef.current = new Audio("/notification.mp3")
    }, [])

  // Initialize notifiedUpcomingTasks from localStorage or empty object
  const [notifiedUpcomingTasks, setNotifiedUpcomingTasks] = useState<{ [taskId: string]: number }>({})
  
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("Notification permission:", perm);
      });
    }
  }, []);
  

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

  const showTaskNotification = async (title: string, body: string) => {
    if ("serviceWorker" in navigator) {
      // OLD: await navigator.serviceWorker.register("/sw.js");
      // NEW: wait until there's an active controller
      const registration = await navigator.serviceWorker.ready;
  
      // show the system notification
      registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
      });
  
      // play a sound for the user
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.play().catch((err) => {
          console.warn("Audio play failed:", err)
        })
      }
    }
  };
  

  // Initialize states from localStorage and set up current time interval
  useEffect(() => {
    const today = getDayName(new Date())
    setSelectedDay(today)

    const savedCompletedTasks = localStorage.getItem("completedTasks")
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks))
    }

    const notifEnabled = localStorage.getItem("notificationsEnabled") === "true"
    setNotificationsEnabled(notifEnabled)

    // Load notification states from localStorage
    const savedLastNotifiedId = localStorage.getItem("lastNotifiedTaskId")
    if (savedLastNotifiedId) {
      setLastNotifiedTaskId(savedLastNotifiedId)
    }

    const savedNotifiedUpcoming = localStorage.getItem("notifiedUpcomingTasks")
    if (savedNotifiedUpcoming) {
      try {
        setNotifiedUpcomingTasks(JSON.parse(savedNotifiedUpcoming))
      } catch (e) {
        console.error("Failed to parse notifiedUpcomingTasks from localStorage", e)
        setNotifiedUpcomingTasks({}) // Reset if parsing fails
      }
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Save completed tasks to localStorage
  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))
  }, [completedTasks])

  // Save lastNotifiedTaskId to localStorage
  useEffect(() => {
    if (lastNotifiedTaskId !== null) {
      localStorage.setItem("lastNotifiedTaskId", lastNotifiedTaskId)
    } else {
      localStorage.removeItem("lastNotifiedTaskId") // Clean up if it becomes null
    }
  }, [lastNotifiedTaskId])

  // Save notifiedUpcomingTasks to localStorage
  useEffect(() => {
    // Avoid saving empty object string if it's already default, though not harmful
    if (Object.keys(notifiedUpcomingTasks).length > 0) {
        localStorage.setItem("notifiedUpcomingTasks", JSON.stringify(notifiedUpcomingTasks))
    } else {
        localStorage.removeItem("notifiedUpcomingTasks") // Clean up if empty
    }
  }, [notifiedUpcomingTasks])


  // Notification logic
  useEffect(() => {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    const today = getDayName(new Date()) // Use current time for today's date
    const todayKey = today as keyof typeof scheduleData.schedule
    const todayTasks = scheduleData.schedule[todayKey] || []
    const currentTask = getCurrentTask(todayTasks, currentTime)

    // Current task started notification
    if (currentTask && currentTask.id !== lastNotifiedTaskId) {
      showTaskNotification("Task Started", `Time to start: ${currentTask.description}`)
      toast({ title: "Task Started", description: currentTask.description })
      setLastNotifiedTaskId(currentTask.id)
    }

    // Upcoming task notifications
    todayTasks.forEach((task) => {
      const taskStartTime = parseTimeString(task.startTime) // Ensure this function correctly parses time for today
      const nowTime = currentTime.getTime()
      
      const taskTime = new Date(nowTime) // Create a new date object for task time calculation

      // Set hours and minutes for taskTime based on task.startTime
      taskTime.setHours(taskStartTime.getHours(), taskStartTime.getMinutes(), 0, 0)

      const minsAway = (taskTime.getTime() - nowTime) / 1000 / 60

      // 2-minute warning
      if (minsAway <= 2 && minsAway > 1.9 && notifiedUpcomingTasks[task.id] !== 2) { // Adjusted threshold slightly for more reliability
        showTaskNotification("Upcoming Task", `In 2 minutes: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 2 minutes: ${task.description}` })
        setNotifiedUpcomingTasks((prev) => ({ ...prev, [task.id]: 2 }))
      }

      // 1-minute warning
      if (minsAway <= 1 && minsAway > 0.9 && notifiedUpcomingTasks[task.id] !== 1) { // Adjusted threshold
        showTaskNotification("Upcoming Task", `In 1 minute: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 1 minute: ${task.description}` })
        setNotifiedUpcomingTasks((prev) => ({ ...prev, [task.id]: 1 }))
      }
    })
  }, [currentTime, notificationsEnabled, lastNotifiedTaskId, toast, notifiedUpcomingTasks, showTaskNotification]) // Added showTaskNotification to deps
  // Midnight reset logic
  useEffect(() => {
    const checkReset = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) { // Check only near the 00:00:00 mark
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

        if (Object.keys(yCompleted).length > 0) {
          archived[yesterday.toISOString().split("T")[0]] = yCompleted
          localStorage.setItem("archivedTasks", JSON.stringify(archived))
        }
        
        // Reset completed tasks for today (clear tasks from the new day that might have been persisted from old structure)
        const today = getDayName(now)
        const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
        const newCompleted = { ...completedTasks };
        // Filter out tasks that are not from previous days
        Object.keys(newCompleted).forEach(taskId => {
            const taskBelongsToToday = todayTasks.some(t => t.id === taskId);
            const taskBelongsToYesterdayOrBefore = !taskBelongsToToday; // simplistic, assumes IDs are unique across days or reset logic is fine
             if (!taskBelongsToToday) { // Or a more robust check if task IDs could be non-unique and from past days
                // This part is tricky; better to just clear based on today's tasks
             }
        });
        // A simpler reset: Clear all completed status for tasks of the *new* current day.
        const freshCompletedTasks: Record<string, boolean> = {};
        // Or, if you want to preserve completed status for tasks from other days (e.g. future days if user navigated):
        // Iterate through completedTasks and only keep those not belonging to 'yesterday'
        // For simplicity, let's just reset based on the new day's known tasks.
        // If `completedTasks` could contain tasks from *future* days that the user manually marked, this needs more care.
        // Assuming completedTasks only holds items relevant to days up to 'yesterday' that we are archiving:
        setCompletedTasks({}) // Simplest: clear all completed tasks

        // Reset notification states for the new day
        setLastNotifiedTaskId(null)
        setNotifiedUpcomingTasks({})
        // localStorage for these will be updated by their respective useEffects

        toast({
          title: "New Day Started!",
          description: "Tasks have been reset for the new day. Yesterday's completed tasks are archived.",
        })
      }
    }

    // Check more frequently around midnight, e.g. every 10 seconds
    const interval = setInterval(checkReset, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [completedTasks, toast]) // Dependencies for midnight reset

  const handleDayChange = (day: string) => setSelectedDay(day)

  const handleNowClick = () => {
    const newCurrentTime = new Date();
    console.log("New current time:", newCurrentTime);
  
    const dayName = getDayName(newCurrentTime);
    console.log("Day name from new current time:", dayName);
  
    setSelectedDay(dayName);
    setCurrentTime(newCurrentTime);
  
    setTimeout(() => {
      const el = document.getElementById("current-task");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.log("current-task element not found");
      }
    }, 0);
  };
  

  const handleTaskCompletion = (id: string, done: boolean) =>
    setCompletedTasks((p) => ({ ...p, [id]: done }))

  const dayTasks = scheduleData.schedule[selectedDay as keyof typeof scheduleData.schedule] || []
  const completedCount = dayTasks.filter((t) => completedTasks[t.id]).length
  const pct = dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">MyFocusDash</h1>
        <div className="flex items-center gap-4 text-lg font-mono text-gray-500 dark:text-gray-400">
          <NowButton onClick={handleNowClick} />
          <TodoPopup />
          <CurrentTimeDisplay />
        </div>
      </header>      
      
      <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />

        <div className="mt-6 mb-4 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {completedCount} of {dayTasks.length} tasks completed
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 dark:bg-teal-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
          <TaskList
            tasks={dayTasks}
            currentTime={currentTime}
            completedTasks={completedTasks}
            onTaskCompletion={handleTaskCompletion}
          />
        </div>
    </div>
  )
}