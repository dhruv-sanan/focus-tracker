import { formatTimeWithSeconds } from "@/lib/utils"

interface CurrentTimeDisplayProps {
  currentTime: Date
}

export default function CurrentTimeDisplay({ currentTime }: CurrentTimeDisplayProps) {
  return (
    <div className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
      {formatTimeWithSeconds(currentTime)}
    </div>
  )
}
