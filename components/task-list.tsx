"use client"

import { useRef, useEffect, useState } from "react"
import type { Task } from "@/types"
import { isCurrentTask, isPastTask, isFutureTask, formatTime, cn } from "@/lib/utils"
import { CheckCircle, Circle, Pencil } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { TaskEditModal } from "./task-edit-modal"

interface TaskListProps {
  tasks: Task[]
  currentTime: Date
  completedTasks: Record<string, boolean>
  onTaskCompletion: (taskId: string, completed: boolean) => void
  onTaskUpdate: (updatedTask: Task) => void
  onTaskDelete: (taskId: string) => void // Added this prop
}

export default function TaskList({ 
  tasks, 
  currentTime, 
  completedTasks, 
  onTaskCompletion,
  onTaskUpdate,
  onTaskDelete // Added this prop
}: TaskListProps) {
  const currentTaskRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/task-completed.mp3")
  }, [])

  // Scroll to current task on initial render and when tasks change
  useEffect(() => {
    if (currentTaskRef.current) {
      currentTaskRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [tasks])

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    onTaskCompletion(taskId, completed)

    // Trigger confetti animation when a task is completed
    if (completed) {
      const canvas = document.createElement("canvas")
      canvas.style.position = "fixed"
      canvas.style.top = "0"
      canvas.style.left = "0"
      canvas.style.width = "100vw"
      canvas.style.height = "100vh"
      canvas.style.pointerEvents = "none"
      canvas.style.zIndex = "1000"
      document.body.appendChild(canvas)
      
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.play().catch((err) => {
          console.warn("Audio play failed:", err)
        })
      }
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      })

      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#26a69a", "#4db6ac", "#80cbc4"],
        disableForReducedMotion: true,
      })

      // Remove canvas after animation
      setTimeout(() => {
        document.body.removeChild(canvas)
      }, 3000)
    }
  }

  const handleEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation() // Prevent task completion when clicking edit
    setEditingTask(task)
  }

  const handleSaveTask = (updatedTask: Task) => {
    onTaskUpdate(updatedTask)
  }

  const handleDeleteTask = (taskId: string) => {
    onTaskDelete(taskId)
    setEditingTask(null) // Close the modal after deletion
  }

  if (tasks.length === 0) {
    return <div className="py-8 text-center text-gray-500 dark:text-gray-400">No tasks scheduled for this day.</div>
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => {
          const isCompleted = completedTasks[task.id] || false
          const isCurrent = isCurrentTask(task, currentTime)
          const isPast = isPastTask(task, currentTime)
          const isFuture = isFutureTask(task, currentTime)

          return (
            <motion.div
              key={task.id}
              id={isCurrent ? "current-task" : undefined}
              onClick={() => handleTaskComplete(task.id, !isCompleted)}
              ref={isCurrent ? currentTaskRef : null}
              className={cn(
                "p-4 rounded-lg border transition-all cursor-pointer group", // Added 'group' class
                isCurrent
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : isPast
                    ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                isCompleted && "border-green-200 dark:border-green-800",
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start gap-3">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskComplete(task.id, !isCompleted)
                  }}
                  className="mt-1 text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </motion.button>

                <div className="flex-1">
                  <div
                    className={cn("flex flex-col gap-1", !isMobile && "sm:flex-row sm:items-center sm:justify-between")}
                  >
                    <h3
                      className={cn(
                        "font-medium text-sm sm:text-base",
                        isCompleted
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-900 dark:text-gray-100",
                        isCurrent && !isCompleted && "text-teal-700 dark:text-teal-300",
                      )}
                    >
                      {task.description}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(task.startTime)} - {formatTime(task.endTime)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditClick(e, task)}
                        className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Edit task</span>
                      </Button>
                    </div>
                  </div>

                  {task.category && (
                    <div className="mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          getCategoryStyles(task.category),
                        )}
                      >
                        {task.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <TaskEditModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask} // Added the onDelete prop
      />
    </>
  )
}

function getCategoryStyles(category: string) {
  switch (category.toLowerCase()) {
    case "inner mastery":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    case "outer mastery":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "office work":
    case "work":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    case "break":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "routine":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    case "wellbeing":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}