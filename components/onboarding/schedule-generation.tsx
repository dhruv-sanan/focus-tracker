"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, Calendar, CheckCircle } from "lucide-react"
import type { UserProfile } from "./onboarding-flow"

interface ScheduleGenerationProps {
  userProfile: UserProfile
  onComplete: (schedule: any) => void
}

const LOADING_MESSAGES = [
  "Analyzing your preferences...",
  "Creating your personalized schedule...",
  "Optimizing time blocks...",
  "Adding wellness activities...",
  "Finalizing your routine...",
]

export function ScheduleGeneration({ userProfile, onComplete }: ScheduleGenerationProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    // Generate schedule
    const generateSchedule = async () => {
      try {
        const response = await fetch("/api/generate-schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userProfile),
        })

        if (!response.ok) {
          throw new Error("Failed to generate schedule")
        }

        const schedule = await response.json()

        // Show completion state briefly
        setIsComplete(true)
        clearInterval(messageInterval)

        setTimeout(() => {
          onComplete(schedule)
        }, 2000)
      } catch (error) {
        console.error("Error generating schedule:", error)
        // Handle error - could show error state or fallback
      }
    }

    generateSchedule()

    return () => clearInterval(messageInterval)
  }, [userProfile, onComplete])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="py-12 px-8">
          <div className="text-center space-y-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-full flex items-center justify-center">
              {isComplete ? (
                <CheckCircle className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              ) : (
                <Sparkles className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isComplete ? "Your Schedule is Ready!" : "Creating Your Perfect Schedule"}
              </h2>

              {!isComplete && (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
                    <p className="text-gray-600 dark:text-gray-300">{LOADING_MESSAGES[currentMessage]}</p>
                  </div>

                  <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "easeInOut" }}
                    />
                  </div>
                </>
              )}

              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <p className="text-gray-600 dark:text-gray-300">
                    We've created a personalized schedule based on your preferences
                  </p>
                  <div className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Redirecting to your dashboard...</span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-400 font-bold">1</span>
                </div>
                <p>Analyze Goals</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-400 font-bold">2</span>
                </div>
                <p>Optimize Time</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-400 font-bold">3</span>
                </div>
                <p>Create Schedule</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
