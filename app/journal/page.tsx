"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import CurrentTimeDisplay from "@/components/current-time-display"

interface JournalEntry {
  id: string
  date: string
  content: string
  mood: string
  tasks: Array<{ id: string; text: string; completed: boolean }>
}

export default function JournalPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [newTask, setNewTask] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()
  const { toast } = useToast()

  // Initialize current date safely (handles SSR)
  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  // Load entries from local storage safely
  useEffect(() => {
    try {
      // Only run in browser environment
      if (typeof window !== "undefined") {
        setIsLoading(true)
        const storedEntries = localStorage.getItem("journal-entries")
        if (storedEntries) {
          setEntries(JSON.parse(storedEntries))
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error loading journal entries:", error)
      setIsLoading(false)
    }
  }, [])

  // Set current entry based on selected date
  useEffect(() => {
    if (!currentDate) return

    try {
      const dateString = format(currentDate, "yyyy-MM-dd")
      const existingEntry = entries.find((entry) => entry.id === dateString)

      if (existingEntry) {
        setCurrentEntry(existingEntry)
      } else {
        setCurrentEntry({
          id: dateString,
          date: dateString,
          content: "",
          mood: "neutral",
          tasks: [],
        })
      }
    } catch (error) {
      console.error("Error setting current entry:", error)
    }
  }, [currentDate, entries])

  const handlePreviousDay = () => {
    if (!currentDate) return

    try {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 1)
      setCurrentDate(newDate)
    } catch (error) {
      console.error("Error navigating to previous day:", error)
    }
  }

  const handleNextDay = () => {
    if (!currentDate) return

    try {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 1)
      setCurrentDate(newDate)
    } catch (error) {
      console.error("Error navigating to next day:", error)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentEntry) return

    try {
      setCurrentEntry({
        ...currentEntry,
        content: e.target.value,
      })
    } catch (error) {
      console.error("Error updating content:", error)
    }
  }

  const handleMoodChange = (mood: string) => {
    if (!currentEntry) return

    try {
      setCurrentEntry({
        ...currentEntry,
        mood,
      })
    } catch (error) {
      console.error("Error updating mood:", error)
    }
  }

  const handleAddTask = () => {
    if (!newTask.trim() || !currentEntry) return

    try {
      const updatedEntry = {
        ...currentEntry,
        tasks: [...currentEntry.tasks, { id: Date.now().toString(), text: newTask, completed: false }],
      }

      setCurrentEntry(updatedEntry)
      setNewTask("")
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleToggleTask = (taskId: string) => {
    if (!currentEntry) return

    try {
      const updatedTasks = currentEntry.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      )

      setCurrentEntry({
        ...currentEntry,
        tasks: updatedTasks,
      })
    } catch (error) {
      console.error("Error toggling task:", error)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (!currentEntry) return

    try {
      const updatedTasks = currentEntry.tasks.filter((task) => task.id !== taskId)

      setCurrentEntry({
        ...currentEntry,
        tasks: updatedTasks,
      })
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const saveEntry = () => {
    if (!currentEntry) return

    try {
      const entryIndex = entries.findIndex((entry) => entry.id === currentEntry.id)
      let updatedEntries

      if (entryIndex >= 0) {
        updatedEntries = [...entries]
        updatedEntries[entryIndex] = currentEntry
      } else {
        updatedEntries = [...entries, currentEntry]
      }

      setEntries(updatedEntries)

      // Only attempt to use localStorage in browser environment
      if (typeof window !== "undefined") {
        localStorage.setItem("journal-entries", JSON.stringify(updatedEntries))
      }

      toast({
        title: "Journal saved",
        description: "Your journal entry has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error saving journal",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      })
    }
  }

  // Handle loading state
  if (isLoading || !currentDate) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading journal...</p>
        </div>
      </div>
    )
  }

  const formattedDate = format(currentDate, "EEEE, MMMM d, yyyy")
  const completedTasksCount = currentEntry?.tasks.filter((task) => task.completed).length || 0
  const totalTasksCount = currentEntry?.tasks.length || 0

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Daily Journal</h1>
        <CurrentTimeDisplay />
      </header>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={saveEntry} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>

        {currentEntry && (
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="journal">Journal</TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks
                {totalTasksCount > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {completedTasksCount}/{totalTasksCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
            </TabsList>

            <TabsContent value="journal" className="space-y-4">
              <Card className="p-6">
                <Textarea
                  placeholder="Write your thoughts for today..."
                  className="min-h-[300px] text-base"
                  value={currentEntry.content}
                  onChange={handleContentChange}
                />
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask()
                    }}
                  />
                  <Button onClick={handleAddTask}>Add</Button>
                </div>

                <Separator className="my-4" />

                {currentEntry.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks for today. Add some tasks to track your progress.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {currentEntry.tasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="h-5 w-5 rounded-md"
                          />
                          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.text}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="mood" className="space-y-4">
              <Card className="p-6">
                <Label className="text-lg mb-4 block">How are you feeling today?</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {["great", "good", "neutral", "tired", "stressed"].map((mood) => (
                    <Button
                      key={mood}
                      variant={currentEntry.mood === mood ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24 capitalize"
                      onClick={() => handleMoodChange(mood)}
                    >
                      {getMoodEmoji(mood)}
                      <span className="mt-2">{mood}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function getMoodEmoji(mood: string): string {
  switch (mood) {
    case "great":
      return "😁"
    case "good":
      return "🙂"
    case "neutral":
      return "😐"
    case "tired":
      return "😴"
    case "stressed":
      return "😫"
    default:
      return "😐"
  }
}
