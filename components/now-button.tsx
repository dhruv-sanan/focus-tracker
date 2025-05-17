"use client"
import { ArrowDown } from "lucide-react"

interface NowButtonProps {
  onClick: () => void
}

export default function NowButton({ onClick }: NowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 md:right-[calc((100vw-43rem)/2-2rem)] inline-flex items-center gap-1 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-md z-10"
    >
      <span>Now</span>
      <ArrowDown className="h-4 w-4" />
    </button>
  )
}