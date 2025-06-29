"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Briefcase, Target, Dumbbell } from "lucide-react"
import type { UserProfile } from "./onboarding-flow"

interface RoutineQuestionnaireProps {
  userName: string
  onSubmit: (data: Omit<UserProfile, "name">) => void
}

const PRIORITY_OPTIONS = [
  "Career Development",
  "Health & Fitness",
  "Personal Growth",
  "Family Time",
  "Learning New Skills",
  "Creative Projects",
  "Social Connections",
  "Financial Goals",
]

const TIME_SLOT_OPTIONS = [
  "Early Morning (5-7 AM)",
  "Morning (7-9 AM)",
  "Mid-Morning (9-11 AM)",
  "Lunch Time (11 AM-1 PM)",
  "Afternoon (1-4 PM)",
  "Evening (4-7 PM)",
  "Night (7-10 PM)",
  "Late Night (10 PM+)",
]

export function RoutineQuestionnaire({ userName, onSubmit }: RoutineQuestionnaireProps) {
  const [formData, setFormData] = useState({
    wakeUpTime: "",
    sleepTime: "",
    workStartTime: "",
    workEndTime: "",
    workType: "" as "office" | "remote" | "hybrid" | "",
    priorities: [] as string[],
    fitnessGoals: "",
    personalGoals: "",
    availableTimeSlots: [] as string[],
  })

  const handlePriorityChange = (priority: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      priorities: checked ? [...prev.priorities, priority] : prev.priorities.filter((p) => p !== priority),
    }))
  }

  const handleTimeSlotChange = (timeSlot: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availableTimeSlots: checked
        ? [...prev.availableTimeSlots, timeSlot]
        : prev.availableTimeSlots.filter((t) => t !== timeSlot),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<UserProfile, "name">)
  }

  const isFormValid =
    formData.wakeUpTime &&
    formData.sleepTime &&
    formData.workStartTime &&
    formData.workEndTime &&
    formData.workType &&
    formData.priorities.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Hi {userName}! Let's learn about your routine
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">This helps us create a schedule that fits your lifestyle</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Time Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-semibold">Time Preferences</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wakeUpTime">Wake up time</Label>
                  <Input
                    id="wakeUpTime"
                    type="time"
                    value={formData.wakeUpTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, wakeUpTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleepTime">Sleep time</Label>
                  <Input
                    id="sleepTime"
                    type="time"
                    value={formData.sleepTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sleepTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workStartTime">Work start time</Label>
                  <Input
                    id="workStartTime"
                    type="time"
                    value={formData.workStartTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, workStartTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEndTime">Work end time</Label>
                  <Input
                    id="workEndTime"
                    type="time"
                    value={formData.workEndTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, workEndTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Work Type */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <Label>Work arrangement</Label>
              </div>
              <Select
                value={formData.workType}
                onValueChange={(value: "office" | "remote" | "hybrid") =>
                  setFormData((prev) => ({ ...prev, workType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priorities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <Label>What are your main priorities? (Select 2-4)</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PRIORITY_OPTIONS.map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={priority}
                      checked={formData.priorities.includes(priority)}
                      onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
                    />
                    <Label htmlFor={priority} className="text-sm">
                      {priority}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-3">
              <Label>When do you prefer to work on personal goals?</Label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOT_OPTIONS.map((timeSlot) => (
                  <div key={timeSlot} className="flex items-center space-x-2">
                    <Checkbox
                      id={timeSlot}
                      checked={formData.availableTimeSlots.includes(timeSlot)}
                      onCheckedChange={(checked) => handleTimeSlotChange(timeSlot, checked as boolean)}
                    />
                    <Label htmlFor={timeSlot} className="text-sm">
                      {timeSlot}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <Label>Goals & Aspirations</Label>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fitnessGoals">Fitness & Health Goals</Label>
                  <Textarea
                    id="fitnessGoals"
                    value={formData.fitnessGoals}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fitnessGoals: e.target.value }))}
                    placeholder="e.g., Lose 10 pounds, run a 5K, build muscle..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalGoals">Personal & Career Goals</Label>
                  <Textarea
                    id="personalGoals"
                    value={formData.personalGoals}
                    onChange={(e) => setFormData((prev) => ({ ...prev, personalGoals: e.target.value }))}
                    placeholder="e.g., Learn a new language, get promoted, start a side business..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
              disabled={!isFormValid}
            >
              Generate My Schedule
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
