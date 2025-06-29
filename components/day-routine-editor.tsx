"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Calendar } from "lucide-react"

interface DayRoutineEditorProps {
  isOpen: boolean
  onClose: () => void
  selectedDay: string
  currentTasks: any[]
  onSave: (newTasks: any[]) => void
}

export function DayRoutineEditor({ isOpen, onClose, selectedDay, currentTasks, onSave }: DayRoutineEditorProps) {
  const [request, setRequest] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!request.trim()) {
      toast({
        title: "Please describe your changes",
        description: "Tell us what you'd like to modify for this day",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/modify-day-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: selectedDay,
          currentTasks,
          request,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to modify schedule")
      }

      const result = await response.json()
      onSave(result.tasks)

      toast({
        title: "Day schedule updated",
        description: `${selectedDay}'s routine has been modified successfully`,
      })

      setRequest("")
      onClose()
    } catch (error) {
      console.error("Error modifying schedule:", error)
      toast({
        title: "Error",
        description: "Failed to modify the schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Modify {selectedDay}'s Routine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="request">What would you like to change?</Label>
            <Textarea
              id="request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="e.g., Add a 30-minute workout session in the morning, move lunch to 1 PM, add time for reading before bed..."
              rows={4}
              disabled={isGenerating}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">AI-Powered Modification</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Using Gemini 1.5 Flash to intelligently modify your {selectedDay} routine while keeping your preferences
              intact.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !request.trim()}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Modify {selectedDay}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
