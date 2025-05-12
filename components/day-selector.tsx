"use client"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DaySelectorProps {
  selectedDay: string
  onDayChange: (day: string) => void
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function DaySelector({ selectedDay, onDayChange }: DaySelectorProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")

  return (
    <div className="flex flex-wrap gap-1 md:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => onDayChange(day)}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
            selectedDay === day
              ? "bg-teal-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
            isMobile && "flex-shrink-0",
          )}
        >
          {isMobile ? day.substring(0, 3) : day}
        </button>
      ))}
    </div>
  )
}
