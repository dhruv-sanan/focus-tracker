"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Home } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import DaySelector from "@/components/day-selector"
import TaskList from "@/components/task-list"
import NowButton from "@/components/now-button"
import TodoPopup from "@/components/to-do-list"
import { AddTaskModal } from "@/components/task-add-modal"
import { AddTaskFab } from "@/components/task-add-float"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/types"
import { useRef } from "react"
import { getDayName, getCurrentTask, parseTimeString } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DayRoutineEditor } from "@/components/day-routine-editor"
import { OnboardingAnimation } from "@/components/onboarding-animation"

interface ScheduleData {
  [key: string]: Task[]
}

export default function HomePage() {
  const [schedule, setSchedule] = useState<ScheduleData>({})
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotifiedTaskId, setLastNotifiedTaskId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [notifiedUpcomingTasks, setNotifiedUpcomingTasks] = useState<{ [taskId: string]: number }>({})
  const [isDayEditorOpen, setIsDayEditorOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          console.log("Service worker already registered:", reg)
        } else {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("Service worker registered from HomePage:", registration)
            })
            .catch((error) => {
              console.error("Service worker registration failed from HomePage:", error)
            })
        }
      })
    }
  }, [])
  
  
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
  }, [])

  const showTaskNotification = async (title: string, body: string) => {
    try {
      if (!("Notification" in window)) {
        console.warn("Notifications not supported in this browser.")
        return
      }
  
      if (Notification.permission !== "granted") {
        console.warn("Notification permission not granted.")
        return
      }
  
      const registration = await navigator.serviceWorker.ready
      console.log("🟢 Service worker ready in showTaskNotification:", registration)
  
      await registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
      })
  
      console.log("✅ Notification shown:", title)
  
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.play().catch((err) => {
          console.warn("Audio play failed:", err)
        })
      }
    } catch (err) {
      console.error("❌ Notification error:", err)
    }
  }
  

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
        setNotifiedUpcomingTasks({})
      }
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Save lastNotifiedTaskId to localStorage
  useEffect(() => {
    if (lastNotifiedTaskId !== null) {
      localStorage.setItem("lastNotifiedTaskId", lastNotifiedTaskId)
    } else {
      localStorage.removeItem("lastNotifiedTaskId")
    }
  }, [lastNotifiedTaskId])
  
  // Save notifiedUpcomingTasks to localStorage
  useEffect(() => {
    if (Object.keys(notifiedUpcomingTasks).length > 0) {
      localStorage.setItem("notifiedUpcomingTasks", JSON.stringify(notifiedUpcomingTasks))
    } else {
      localStorage.removeItem("notifiedUpcomingTasks")
    }
  }, [notifiedUpcomingTasks])

  // Notification logic
  useEffect(() => {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    const today = getDayName(new Date())
    const todayTasks = schedule[today] || [] // Fixed: Direct access to schedule[today]
    const currentTask = getCurrentTask(todayTasks, currentTime)

    // Current task started notification
    if (currentTask && currentTask.id !== lastNotifiedTaskId) {
      showTaskNotification("Task Started", `Time to start: ${currentTask.description}`)
      toast({ title: "Task Started", description: currentTask.description })
      setLastNotifiedTaskId(currentTask.id)
    }

    // Upcoming task notifications
    todayTasks.forEach((task) => {
      const taskStartTime = parseTimeString(task.startTime)
      const nowTime = currentTime.getTime()
      
      const taskTime = new Date(nowTime)
      taskTime.setHours(taskStartTime.getHours(), taskStartTime.getMinutes(), 0, 0)

      const minsAway = (taskTime.getTime() - nowTime) / 1000 / 60

      // 2-minute warning
      if (minsAway <= 2 && minsAway > 1.9 && notifiedUpcomingTasks[task.id] !== 2) {
        showTaskNotification("Upcoming Task", `In 2 minutes: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 2 minutes: ${task.description}` })
        setNotifiedUpcomingTasks((prev) => ({ ...prev, [task.id]: 2 }))
      }
      // 1-minute warning
      if (minsAway <= 1 && minsAway > 0.9 && notifiedUpcomingTasks[task.id] !== 1) {
        showTaskNotification("Upcoming Task", `In 1 minute: ${task.description}`)
        toast({ title: "Upcoming Task", description: `In 1 minute: ${task.description}` })
        setNotifiedUpcomingTasks((prev) => ({ ...prev, [task.id]: 1 }))
      }
    })
  }, [currentTime, notificationsEnabled, lastNotifiedTaskId, toast, notifiedUpcomingTasks, showTaskNotification, schedule])

  // Midnight reset logic
  useEffect(() => {
    const checkReset = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yName = getDayName(yesterday)
        const archived = JSON.parse(localStorage.getItem("archivedTasks") || "{}")
        const yTasks = schedule[yName] || [] // Fixed: Direct access to schedule[yName]

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
        
        // Reset completed tasks for the new day
        setCompletedTasks({})

        // Reset notification states for the new day
        setLastNotifiedTaskId(null)
        setNotifiedUpcomingTasks({})

        toast({
          title: "New Day Started!",
          description: "Tasks have been reset for the new day. Yesterday's completed tasks are archived.",
        })
      }
    }

    const interval = setInterval(checkReset, 10000)
    return () => clearInterval(interval)
  }, [completedTasks, toast, schedule])

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboardingComplete")
    const hasSeenAnimation = localStorage.getItem("hasSeenOnboardingAnimation")

    if (!onboardingComplete) {
      router.push("/onboarding")
      return
    }
    if (!hasSeenAnimation) {
      setShowOnboarding(true)
      return
    }

    // Load schedule data
    const savedSchedule = localStorage.getItem("schedule")
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule)
        // Handle both nested and flat schedule structures
        setSchedule(parsedSchedule.schedule || parsedSchedule)
      } catch (error) {
        console.error("Failed to parse saved schedule:", error)
        router.push("/onboarding")
        return
      }
    }

    // Load completed tasks from localStorage
    const savedCompletedTasks = localStorage.getItem("completedTasks")
    if (savedCompletedTasks) {
      try {
        const parsed = JSON.parse(savedCompletedTasks)
        if (Array.isArray(parsed)) {
          const completedTasksRecord: Record<string, boolean> = {}
          parsed.forEach(taskId => {
            completedTasksRecord[taskId] = true
          })
          setCompletedTasks(completedTasksRecord)
        } else {
          setCompletedTasks(parsed)
        }
      } catch (error) {
        console.error("Failed to parse completed tasks:", error)
        setCompletedTasks({})
      }
    }

    setIsLoading(false)
  }, [router])

  // Update current time
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date())
    }

    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboardingAnimation", "true")
    setShowOnboarding(false)

    // Load schedule data after animation
    const savedSchedule = localStorage.getItem("schedule")
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule)
        setSchedule(parsedSchedule.schedule || parsedSchedule)
      } catch (error) {
        console.error("Failed to parse saved schedule:", error)
      }
    }

    // Load completed tasks
    const savedCompletedTasks = localStorage.getItem("completedTasks")
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks))
    }

    setIsLoading(false)
  }

  const handleDayChange = (day: string) => {
    setSelectedDay(day)
  }

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
        toast({
          title: "No current task",
          description: "There are no tasks scheduled for this time",
        })
      }
    }, 0);
  };

  const handleDayRoutineUpdate = (newTasks: Task[]) => {
    setSchedule((prev) => {
      const updatedSchedule = { ...prev }
      updatedSchedule[selectedDay] = newTasks
      localStorage.setItem("schedule", JSON.stringify({ schedule: updatedSchedule }))
      return updatedSchedule
    })
  }

  const handleTaskCompletion = (taskId: string, completed: boolean) => {
    setCompletedTasks((prev) => {
      const newCompletedTasks = { ...prev, [taskId]: completed }

      const completedArray = Object.keys(newCompletedTasks).filter(id => newCompletedTasks[id])
      localStorage.setItem("completedTasks", JSON.stringify(completedArray))
      
      return newCompletedTasks
    })
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setSchedule((prev) => {
      const updatedSchedule = { ...prev }
      const dayTasks = [...(updatedSchedule[selectedDay] || [])]
      const taskIndex = dayTasks.findIndex((task) => task.id === updatedTask.id)

      if (taskIndex !== -1) {
        dayTasks[taskIndex] = {
          ...dayTasks[taskIndex],
          ...updatedTask,
          category: updatedTask.category || dayTasks[taskIndex].category || "Routine"
        }
        updatedSchedule[selectedDay] = dayTasks

        localStorage.setItem("schedule", JSON.stringify({ schedule: updatedSchedule }))

        toast({
          title: "Task updated",
          description: "Your changes have been saved",
        })
      }

      return updatedSchedule
    })
  }

  const handleTaskDelete = (taskId: string) => {
    console.log("Deleting task with ID:", taskId)
    
    if (!taskId) {
      console.error("No task ID provided for deletion")
      return
    }

    setSchedule((prev) => {
      const updatedSchedule = { ...prev }
      const dayTasks = [...(updatedSchedule[selectedDay] || [])]
      
      const filteredTasks = dayTasks.filter(task => task.id !== taskId)
      updatedSchedule[selectedDay] = filteredTasks

      localStorage.setItem("schedule", JSON.stringify({ schedule: updatedSchedule }))

      return updatedSchedule
    })

    setCompletedTasks((prev) => {
      const newCompletedTasks = { ...prev }
      delete newCompletedTasks[taskId]
      
      const completedArray = Object.keys(newCompletedTasks).filter(id => newCompletedTasks[id])
      localStorage.setItem("completedTasks", JSON.stringify(completedArray))
      
      return newCompletedTasks
    })

    toast({
      title: "Task deleted",
      description: "The task has been removed from your schedule",
    })
  }

  const generateTaskId = (): string => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: generateTaskId()
    }

    setSchedule((prev) => {
      const updatedSchedule = { ...prev }
      const dayTasks = [...(updatedSchedule[selectedDay] || [])]
      
      dayTasks.push(newTask)
      dayTasks.sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number)
        const timeB = b.startTime.split(':').map(Number)
        const minutesA = timeA[0] * 60 + timeA[1]
        const minutesB = timeB[0] * 60 + timeB[1]
        return minutesA - minutesB
      })
      
      updatedSchedule[selectedDay] = dayTasks

      localStorage.setItem("schedule", JSON.stringify({ schedule: updatedSchedule }))

      return updatedSchedule
    })
  }

  if (showOnboarding) {
    return <OnboardingAnimation onComplete={handleOnboardingComplete} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  const dayTasks = schedule[selectedDay] || []

  const completedCount = dayTasks.filter((task) => completedTasks[task.id]).length
  const pct = dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <PageHeader
        title="MyFocusDash"
        icon={<Home className="h-6 w-6" />}
        className="text-teal-600 dark:text-teal-400"
        actions={<TodoPopup />}
      />
      <NowButton onClick={handleNowClick} />


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />
        <Button
          onClick={() => setIsDayEditorOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-teal-200 dark:border-teal-800"
        >
          <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-teal-600 dark:text-teal-400 font-medium">Modify {selectedDay}</span>
        </Button>
      </div>


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
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      </div>

      {/* <AddTaskFab onClick={() => setIsAddTaskModalOpen(true)} /> */}

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={handleAddTask}
        selectedDay={selectedDay}
        existingTasks={dayTasks}
      />
      <DayRoutineEditor
        isOpen={isDayEditorOpen}
        onClose={() => setIsDayEditorOpen(false)}
        selectedDay={selectedDay}
        currentTasks={dayTasks}
        onSave={handleDayRoutineUpdate}
      />
    </div>
  )
}