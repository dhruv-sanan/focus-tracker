"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NameStep } from "./name-step"
import { RoutineQuestionnaire } from "./routine-questionnaire"
import { ScheduleGeneration } from "./schedule-generation"

export interface UserProfile {
  name: string
  wakeUpTime: string
  sleepTime: string
  workStartTime: string
  workEndTime: string
  workType: "office" | "remote" | "hybrid"
  priorities: string[]
  fitnessGoals: string
  personalGoals: string
  availableTimeSlots: string[]
}

interface OnboardingFlowProps {
  onComplete: (schedule: any) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({})

  const handleNameSubmit = (name: string) => {
    setUserProfile((prev) => ({ ...prev, name }))
    setCurrentStep(1)
  }

  const handleRoutineSubmit = (routineData: Omit<UserProfile, "name">) => {
    setUserProfile((prev) => ({ ...prev, ...routineData }))
    setCurrentStep(2)
  }

  const handleScheduleGenerated = (schedule: any) => {
    onComplete(schedule)
  }

  const steps = [
    <NameStep key="name" onSubmit={handleNameSubmit} />,
    <RoutineQuestionnaire key="routine" userName={userProfile.name || ""} onSubmit={handleRoutineSubmit} />,
    <ScheduleGeneration
      key="generation"
      userProfile={userProfile as UserProfile}
      onComplete={handleScheduleGenerated}
    />,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
