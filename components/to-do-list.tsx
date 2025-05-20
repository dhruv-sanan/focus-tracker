"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface Task {
  id: string
  text: string
  completed: boolean
}
interface JournalEntry {
  id: string
  date: string
  content: string
  mood: string
  tasks: Task[]
}

export default function TodoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const { toast } = useToast()
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 })

  // Load journal entries from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("journal-entries")
    setEntries(stored ? JSON.parse(stored) : [])
  }, [isOpen]) // reload when popup opens to stay in sync

  // Calculate position when popup opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      })
    }
  }, [isOpen])

  // Handle click outside to close the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    // Handle escape key press
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  // Flatten all incomplete tasks with their entry date
  const incompleteTasks = entries.flatMap((entry) =>
    entry.tasks
      .filter((task) => !task.completed)
      .map((task) => ({
        ...task,
        entryDate: entry.date,
      })),
  )

  // Toggle completion and update localStorage
  const handleToggleTask = (taskId: string) => {
    const updatedEntries = entries.map((entry) => ({
      ...entry,
      tasks: entry.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    }))
    setEntries(updatedEntries)
    localStorage.setItem("journal-entries", JSON.stringify(updatedEntries))
    toast({ title: "Task updated" })
  }

  return (
    <div className="relative">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                <Button
                    ref={buttonRef}
                    className="rounded-full h-14 w-14 shadow-lg text-2xl flex items-center justify-center"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Show all todos"
                >
                    📋
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Incomplete tasks</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      

      {isOpen && (
        <div className="fixed inset-0 z-50" style={{ pointerEvents: "none" }}>
          <div
            className="absolute bg-black/40 inset-0 transition-opacity duration-200"
            style={{
              opacity: isOpen ? 1 : 0,
              pointerEvents: "auto",
            }}
          />
          <Card
            ref={cardRef}
            className="absolute shadow-2xl rounded-xl overflow-hidden w-80 md:w-96 transition-all duration-300 ease-out"
            style={{
              top: `${popupPosition.top}px`,
              right: `${popupPosition.right}px`,
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateY(0)" : "translateY(-20px)",
              pointerEvents: "auto",
            }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-semibold">Pending Tasks</span>
                <Badge variant="outline">{incompleteTasks.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div
              className="overflow-y-auto bg-background"
              style={{ maxHeight: "calc(5 * 64px)" }} // Approximate height for 5 tasks
            >
              {incompleteTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm md:text-base">
                  <p>All tasks completed! 🎉</p>
                  <p className="text-xs md:text-sm mt-2">To add more tasks, go to Journal &gt; Tasks</p>
                </div>
              ) : (
                <ul className="space-y-3 p-4">
                  {incompleteTasks.map((task) => (
                    <li
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // prevent React warning; logic handled by <li> onClick
                        onClick={(e) => e.stopPropagation()} // prevent bubbling to <li>
                        className="h-5 w-5 rounded border-muted"
                        aria-label="Mark task as done"
                      />
                      <div className="flex-1">
                      <p className="font-medium text-sm md:text-base">{task.text}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                        {format(new Date(task.entryDate), "MMM d, yyyy")}
                        </p>

                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
