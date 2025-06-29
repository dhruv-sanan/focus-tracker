"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/types"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newTask: Omit<Task, 'id'>) => void
  selectedDay: string
  existingTasks: Task[]
}

const CATEGORIES = ["Routine", "Inner Mastery", "Outer Mastery", "Work", "Break", "Wellbeing"]

export function AddTaskModal({ isOpen, onClose, onSave, selectedDay, existingTasks }: AddTaskModalProps) {
  const [newTask, setNewTask] = useState<{
    startTime: string
    endTime: string
    description: string
    category: string
  }>({
    startTime: "",
    endTime: "",
    description: "",
    category: "",
  })
  
  const { toast } = useToast()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewTask({
        startTime: "",
        endTime: "",
        description: "",
        category: "",
      })
    }
  }, [isOpen])

  const handleChange = (field: string, value: string) => {
    setNewTask((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const checkTimeOverlap = (startTime: string, endTime: string): boolean => {
    const newStartMinutes = timeToMinutes(startTime)
    const newEndMinutes = timeToMinutes(endTime)

    return existingTasks.some(task => {
      const taskStartMinutes = timeToMinutes(task.startTime)
      const taskEndMinutes = timeToMinutes(task.endTime)
      
      // Check if new task overlaps with existing task
      return (
        (newStartMinutes >= taskStartMinutes && newStartMinutes < taskEndMinutes) ||
        (newEndMinutes > taskStartMinutes && newEndMinutes <= taskEndMinutes) ||
        (newStartMinutes <= taskStartMinutes && newEndMinutes >= taskEndMinutes)
      )
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(newTask.startTime) || !timeRegex.test(newTask.endTime)) {
      toast({
        title: "Invalid time format",
        description: "Please use the format HH:MM (24-hour)",
        variant: "destructive",
      })
      return
    }

    // Validate start time is before end time
    const startMinutes = timeToMinutes(newTask.startTime)
    const endMinutes = timeToMinutes(newTask.endTime)
    
    if (startMinutes >= endMinutes) {
      toast({
        title: "Invalid time range",
        description: "Start time must be before end time",
        variant: "destructive",
      })
      return
    }

    // Check for time overlap with existing tasks
    if (checkTimeOverlap(newTask.startTime, newTask.endTime)) {
      toast({
        title: "Time conflict",
        description: "This time slot overlaps with an existing task",
        variant: "destructive",
      })
      return
    }

    // Validate description
    if (!newTask.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }

    // Validate category
    if (!newTask.category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    // Create new task
    const taskToAdd: Omit<Task, 'id'> = {
      startTime: newTask.startTime,
      endTime: newTask.endTime,
      description: newTask.description.trim(),
      category: newTask.category,
    }

    onSave(taskToAdd)
    toast({
      title: "Task added",
      description: `New task added to ${selectedDay}`,
    })
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task - {selectedDay}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                value={newTask.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="HH:MM"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                value={newTask.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                placeholder="HH:MM"
                className="font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newTask.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Task description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={newTask.category} 
              onValueChange={(value) => handleChange("category", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}