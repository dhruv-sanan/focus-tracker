"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, RefreshCw, Calendar, Clock } from "lucide-react"

interface Task {
  id: string
  startTime: string
  endTime: string
  description: string
  category: string
}

interface SchedulePreviewProps {
  schedule: {
    schedule: {
      [key: string]: Task[]
    }
  }
  onAccept: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function SchedulePreview({ schedule, onAccept, onRegenerate, isRegenerating = false }: SchedulePreviewProps) {
  const [selectedDay, setSelectedDay] = useState("Monday")

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Routine: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      "Inner Mastery": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Outer Mastery": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Work: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      Break: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Wellbeing: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    }
    return colors[category] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Your Personalized Schedule</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Review your AI-generated weekly routine</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {DAYS.map((day) => (
                <TabsTrigger key={day} value={day} className="text-xs">
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map((day) => (
              <TabsContent key={day} value={day} className="mt-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {schedule.schedule[day]?.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {formatTime(task.startTime)} - {formatTime(task.endTime)}
                              </span>
                              <Badge className={`text-xs ${getCategoryColor(task.category)}`}>{task.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onRegenerate}
              variant="outline"
              className="flex-1 flex items-center gap-2"
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Regenerating with Gemini 2.0...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Not satisfied? Try Gemini 2.0 Flash
                </>
              )}
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
              disabled={isRegenerating}
            >
              <CheckCircle className="w-4 h-4" />
              Accept Schedule
            </Button>
          </div>

          {!isRegenerating && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="font-medium text-blue-700 dark:text-blue-300">💡 Pro Tip</p>
              <p>
                Not happy with the schedule? Click "Try Gemini 2.0 Flash" for a more detailed and personalized schedule.
                Note: This will take longer but provides better results!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
