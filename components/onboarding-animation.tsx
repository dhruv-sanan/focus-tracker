"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Calendar, Target, Clock, Sparkles } from "lucide-react"

interface OnboardingAnimationProps {
  onComplete: () => void
}

const ONBOARDING_STEPS = [
  {
    icon: Calendar,
    title: "Welcome to MyFocusDash",
    description: "Your AI-powered personal productivity companion",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900",
  },
  {
    icon: Target,
    title: "Personalized Schedules",
    description: "AI creates schedules tailored to your goals and lifestyle",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    icon: Clock,
    title: "Smart Time Management",
    description: "Track progress and stay focused on what matters most",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    icon: Sparkles,
    title: "Adaptive & Flexible",
    description: "Modify your routine anytime with AI assistance",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900",
  },
]

export function OnboardingAnimation({ onComplete }: OnboardingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ONBOARDING_STEPS.length - 1) {
          return prev + 1
        } else {
          setIsComplete(true)
          return prev
        }
      })
    }, 2500)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isComplete) {
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 2000)
      return () => clearTimeout(completeTimer)
    }
  }, [isComplete, onComplete])

  const CurrentIcon = ONBOARDING_STEPS[currentStep]?.icon || Calendar

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="py-12 px-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`mx-auto w-20 h-20 ${ONBOARDING_STEPS[currentStep].bgColor} rounded-full flex items-center justify-center mb-6`}
                  >
                    <CurrentIcon className={`w-10 h-10 ${ONBOARDING_STEPS[currentStep].color}`} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                  >
                    {ONBOARDING_STEPS[currentStep].title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-gray-600 dark:text-gray-300 text-lg"
                  >
                    {ONBOARDING_STEPS[currentStep].description}
                  </motion.p>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-8 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mx-auto"
                    style={{ maxWidth: "200px" }}
                  />

                  <div className="flex justify-center mt-4 space-x-2">
                    {ONBOARDING_STEPS.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          index <= currentStep ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="py-12 px-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                    className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                  >
                    You're All Set!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-gray-600 dark:text-gray-300 text-lg"
                  >
                    Welcome to your personalized productivity dashboard
                  </motion.p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6 flex justify-center"
                  >
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-teal-500 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
