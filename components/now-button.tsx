"use client"
import { ArrowDown } from "lucide-react"
import { Button } from "./ui/button"

interface NowButtonProps {
  onClick: () => void
}

export default function NowButton({ onClick }: NowButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-primary/20 px-6 fixed bottom-4 inline-flex items-center gap-1 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-md z-10"
    >
      <span>Now</span>
      <ArrowDown className="h-4 w-4" />
    </Button>
  )
}