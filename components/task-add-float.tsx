"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface AddTaskFabProps {
  onClick: () => void
}

// Haptic feedback utility
const triggerHaptic = (pattern: number | number[] = 50) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern)
  }
}

export function AddTaskFab({ onClick }: AddTaskFabProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    triggerHaptic([20, 10, 20, 10, 40]) // Unique pattern for add action
    onClick()
  }

  return (
    <motion.div
      className="fixed top-20 left-4 md:left-6 z-40"
      initial={{ scale: 0, opacity: 0, x: -100 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.4,
      }}
      onHoverStart={() => {
        setIsHovered(true)
        triggerHaptic(10) // Light haptic on hover
      }}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.9,
        transition: { duration: 0.1 },
      }}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="h-14 w-14 rounded-full bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
      >
        <motion.div
          animate={{
            rotate: isHovered ? 180 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Plus className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200" />
        </motion.div>

        {/* Ripple effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-teal-100 dark:bg-teal-900/30 rounded-full"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        <span className="sr-only">Add new task</span>
      </Button>

      {/* Floating label */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            Add Task
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
