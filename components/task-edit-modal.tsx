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

interface TaskEditModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onSave: (updatedTask: Task) => void
  onDelete: (taskId: string) => void
}

const CATEGORIES = ["Routine", "Inner Mastery", "Outer Mastery", "Work", "Break", "Wellbeing"]

export function TaskEditModal({ isOpen, onClose, task, onSave, onDelete }: TaskEditModalProps) {
  const [editedTask, setEditedTask] = useState<{
    id: string
    startTime: string
    endTime: string
    description: string
    category: string
  }>({
    id: "",
    startTime: "",
    endTime: "",
    description: "",
    category: "",
  })
  
  const { toast } = useToast()

  // Update local state when the task prop changes (proper prepopulation)
  useEffect(() => {
    if (task) {
      setEditedTask({
        id: task.id,
        startTime: task.startTime,
        endTime: task.endTime,
        description: task.description,
        category: task.category || "", // Handle undefined category
      })
    }
  }, [task])

  const handleChange = (field: string, value: string) => {
    setEditedTask((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(editedTask.startTime) || !timeRegex.test(editedTask.endTime)) {
      toast({
        title: "Invalid time format",
        description: "Please use the format HH:MM (24-hour)",
        variant: "destructive",
      })
      return
    }

    // Validate start time is before end time
    const [startHour, startMin] = editedTask.startTime.split(':').map(Number)
    const [endHour, endMin] = editedTask.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (startMinutes >= endMinutes) {
      toast({
        title: "Invalid time range",
        description: "Start time must be before end time",
        variant: "destructive",
      })
      return
    }

    // Validate description
    if (!editedTask.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }

    // Validate category
    if (!editedTask.category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    // Create updated task with proper type
    const updatedTask: Task = {
      ...task!,
      startTime: editedTask.startTime,
      endTime: editedTask.endTime,
      description: editedTask.description.trim(),
      category: editedTask.category,
    }

    onSave(updatedTask)
    toast({
      title: "Task updated",
      description: "Your changes have been saved",
    })
    onClose()
  }

  const handleDelete = () => {
    if (task) {
      onDelete(task.id)
      toast({
        title: "Task deleted",
        description: "The task has been removed from your schedule",
      })
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form when closing
    setEditedTask({
      id: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                value={editedTask.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="HH:MM"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                value={editedTask.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                placeholder="HH:MM"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editedTask.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Task description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={editedTask.category} 
              onValueChange={(value) => handleChange("category", value)}
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

          <DialogFooter className="flex justify-between items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{task?.description}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}