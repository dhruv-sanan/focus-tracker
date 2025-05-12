"use client"

import { useState, useEffect, useRef } from "react"
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
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const { toast } = useToast()

  // Initialize selected day and completed tasks from localStorage
  useEffect(() => {
    const today = getDayName(new Date())
    setSelectedDay(today)

    const savedCompletedTasks = localStorage.getItem("completedTasks")
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks))
    }

    // Check if notifications were previously enabled
    const notifEnabled = localStorage.getItem("notificationsEnabled") === "true"
    setNotificationsEnabled(notifEnabled)

    // Update current time every second for more accurate notifications
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
          swRegistrationRef.current = registration

          // Check for existing push subscription
          return registration.pushManager.getSubscription()
        })
        .then((subscription) => {
          if (subscription) {
            console.log("Existing push subscription found")
            setPushSubscription(subscription)
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "COMPLETE_TASK") {
          handleTaskCompletion(event.data.taskId, true)
        }
      })
    }

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))
  }, [completedTasks])

  // Check for task transitions and send notifications
  useEffect(() => {
    if (!notificationsEnabled) return

    const today = getDayName(new Date())
    const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
    const currentTask = getCurrentTask(todayTasks, currentTime)

    // If there's a current task and we haven't notified about it yet
    if (currentTask && currentTask.id !== lastNotifiedTaskId) {
      // Send notification for task start
      if (Notification.permission === "granted") {
        new Notification("Task Started", {
          body: `Time to start: ${currentTask.description}`,
          icon: "/icons/icon-192x192.png",
        })
      }

      // If we have a push subscription, send a push notification
      if (pushSubscription) {
        sendPushNotification({
          title: "Task Started",
          body: `Time to start: ${currentTask.description}`,
          url: "/",
          taskId: currentTask.id,
        })
      }

      setLastNotifiedTaskId(currentTask.id)

      // Show toast notification as well
      toast({
        title: "Task Started",
        description: currentTask.description,
      })
    }

    // Check for upcoming tasks (within 2 minutes)
    todayTasks.forEach((task) => {
      const taskStartTime = parseTimeString(task.startTime)
      const timeUntilStart = (taskStartTime.getTime() - currentTime.getTime()) / 1000 / 60 // minutes

      // If task starts in 2 minutes or less but hasn't started yet
      if (timeUntilStart <= 2 && timeUntilStart > 0) {
        // Send notification for upcoming task
        if (Notification.permission === "granted") {
          new Notification("Upcoming Task", {
            body: `In ${Math.round(timeUntilStart)} minutes: ${task.description}`,
            icon: "/icons/icon-192x192.png",
          })
        }

        // If we have a push subscription, send a push notification
        if (pushSubscription) {
          sendPushNotification({
            title: "Upcoming Task",
            body: `In ${Math.round(timeUntilStart)} minutes: ${task.description}`,
            url: "/",
            taskId: task.id,
          })
        }

        // Show toast notification as well
        toast({
          title: "Upcoming Task",
          description: `In ${Math.round(timeUntilStart)} minutes: ${task.description}`,
        })
      }
    })
  }, [currentTime, notificationsEnabled, lastNotifiedTaskId, pushSubscription, toast])

  // Check at midnight if we need to reset tasks
  useEffect(() => {
    const checkForReset = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        // It's midnight, archive yesterday's tasks and reset
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayName = getDayName(yesterday)

        // Archive completed tasks for yesterday
        const archivedTasks = JSON.parse(localStorage.getItem("archivedTasks") || "{}")
        const yesterdayTasks = scheduleData.schedule[yesterdayName as keyof typeof scheduleData.schedule] || []

        const yesterdayCompleted: Record<string, boolean> = {}
        yesterdayTasks.forEach((task) => {
          if (completedTasks[task.id]) {
            yesterdayCompleted[task.id] = true
          }
        })

        archivedTasks[yesterday.toISOString().split("T")[0]] = yesterdayCompleted
        localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks))

        // Reset today's tasks
        const today = getDayName(now)
        const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []

        const newCompletedTasks = { ...completedTasks }
        todayTasks.forEach((task) => {
          delete newCompletedTasks[task.id]
        })

        setCompletedTasks(newCompletedTasks)
        toast({
          title: "New Day Started",
          description: "Yesterday's tasks have been archived and today's tasks reset.",
        })
      }
    }

    // Check every minute
    const interval = setInterval(checkForReset, 60000)
    return () => clearInterval(interval)
  }, [completedTasks, toast])

  const handleDayChange = (day: string) => {
    setSelectedDay(day)
  }

  const handleNowClick = () => {
    const today = getDayName(new Date())
    setSelectedDay(today)
    setCurrentTime(new Date())

    // Scroll to current task (implementation in TaskList component)
    const currentTaskElement = document.getElementById("current-task")
    if (currentTaskElement) {
      currentTaskElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleTaskCompletion = (taskId: string, completed: boolean) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: completed,
    }))
  }

  const handleResetTasks = () => {
    // Reset only the tasks for the selected day
    const dayTasks = scheduleData.schedule[selectedDay as keyof typeof scheduleData.schedule] || []
    const newCompletedTasks = { ...completedTasks }

    dayTasks.forEach((task) => {
      delete newCompletedTasks[task.id]
    })

    setCompletedTasks(newCompletedTasks)
    toast({
      title: "Tasks Reset",
      description: `All tasks for ${selectedDay} have been reset.`,
    })
  }

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      })
      return
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true)
      localStorage.setItem("notificationsEnabled", "true")

      // Subscribe to push notifications if service worker is registered
      if (swRegistrationRef.current && !pushSubscription) {
        try {
          const subscription = await subscribeToPushNotifications(swRegistrationRef.current)
          if (subscription) {
            setPushSubscription(subscription)
            // Here you would typically send the subscription to your server
            console.log("Push subscription created:", subscription)
          }
        } catch (error) {
          console.error("Failed to subscribe to push notifications:", error)
        }
      }

      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications for task transitions.",
      })
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        localStorage.setItem("notificationsEnabled", "true")

        // Subscribe to push notifications if service worker is registered
        if (swRegistrationRef.current) {
          try {
            const subscription = await subscribeToPushNotifications(swRegistrationRef.current)
            if (subscription) {
              setPushSubscription(subscription)
              // Here you would typically send the subscription to your server
              console.log("Push subscription created:", subscription)
            }
          } catch (error) {
            console.error("Failed to subscribe to push notifications:", error)
          }
        }

        toast({
          title: "Notifications Enabled",
          description: "You'll receive notifications for task transitions.",
        })
      }
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      })
    }
  }

  const handleDisableNotifications = async () => {
    setNotificationsEnabled(false)
    localStorage.setItem("notificationsEnabled", "false")

    // Unsubscribe from push notifications
    if (pushSubscription) {
      try {
        await pushSubscription.unsubscribe()
        setPushSubscription(null)
        // Here you would typically remove the subscription from your server
        console.log("Push subscription removed")
      } catch (error) {
        console.error("Failed to unsubscribe from push notifications:", error)
      }
    }

    toast({
      title: "Notifications Disabled",
      description: "You won't receive notifications for task transitions.",
    })
  }

  const dayTasks = scheduleData.schedule[selectedDay as keyof typeof scheduleData.schedule] || []
  const currentTask = getCurrentTask(dayTasks, currentTime)

  // Calculate completion percentage for the selected day
  const totalTasks = dayTasks.length
  const completedTasksCount = dayTasks.filter((task) => completedTasks[task.id]).length
  const completionPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Header />
          <div className="flex items-center gap-2">
            <CurrentTimeDisplay currentTime={currentTime} />
            <NowButton onClick={handleNowClick} />
          </div>
        </div>

        <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {completedTasksCount} of {totalTasks} tasks completed
            </div>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-2">
            {notificationsEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisableNotifications}
                className="text-xs flex items-center gap-1"
              >
                <BellOff className="h-3 w-3" />
                Disable Alerts
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                className="text-xs flex items-center gap-1"
              >
                <Bell className="h-3 w-3" />
                Enable Alerts
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetTasks}
              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Reset
            </Button>
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

// Function to subscribe to push notifications
async function subscribeToPushNotifications(
  swRegistration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  try {
    // This would typically come from your server in a real app
    const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

    // Convert the VAPID key to the format expected by the browser
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    // Subscribe the user
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })

    return subscription
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error)
    return null
  }
}

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Function to send a push notification
// In a real app, this would be done from your server
function sendPushNotification(data: { title: string; body: string; url: string; taskId: string }) {
  // This is a mock function - in a real app, you would send this to your server
  // which would then use the Web Push API to send the notification
  console.log("Would send push notification:", data)

  // For demo purposes, we'll just show a regular notification
  if (Notification.permission === "granted") {
    new Notification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
    })
  }
}
