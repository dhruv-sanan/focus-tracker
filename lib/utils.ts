import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDayName(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[date.getDay()] // Adjust to make Monday first day
}

export function formatTime(timeString: string): string {
  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = timeString.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function formatTimeWithSeconds(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

export function parseTimeString(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

export function getCurrentTask(tasks: Task[], currentTime: Date): Task | null {
  return tasks.find((task) => isCurrentTask(task, currentTime)) || null
}

export function isCurrentTask(task: Task, currentTime: Date): boolean {
  const taskStartTime = parseTimeString(task.startTime)
  const taskEndTime = parseTimeString(task.endTime)

  return currentTime >= taskStartTime && currentTime < taskEndTime
}

export function isPastTask(task: Task, currentTime: Date): boolean {
  const taskEndTime = parseTimeString(task.endTime)
  return currentTime >= taskEndTime
}

export function isFutureTask(task: Task, currentTime: Date): boolean {
  const taskStartTime = parseTimeString(task.startTime)
  return currentTime < taskStartTime
}

export function getTaskStatus(
  task: Task,
  currentTime: Date,
  isCompleted: boolean,
): "completed" | "current" | "past" | "future" {
  if (isCompleted) return "completed"
  if (isCurrentTask(task, currentTime)) return "current"
  if (isPastTask(task, currentTime)) return "past"
  return "future"
}
