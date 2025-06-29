"use client"
import { ArrowDown } from "lucide-react"
import { Button } from "./ui/button"
import { motion } from "framer-motion"

interface NowButtonProps {
  onClick: () => void
}

// Haptic feedback utility
const triggerHaptic = (pattern: number | number[] = 50) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern)
  }
}

export default function NowButton({ onClick }: NowButtonProps) {
  const handleClick = () => {
    triggerHaptic([30, 10, 30]) // Double tap pattern
    onClick()
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 md:right-6 z-50"
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.1,
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl px-6 py-3 inline-flex items-center gap-2 text-white font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 group"
      >
        <span>Now</span>
        <motion.div
          animate={{
            y: [0, 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <ArrowDown className="h-4 w-4 group-hover:animate-bounce" />
        </motion.div>
      </Button>
    </motion.div>
  )
}
