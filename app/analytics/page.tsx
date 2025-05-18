"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar, BarChart2, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import scheduleData from "@/data/schedule.json"
import { getDayName } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import CurrentTimeDisplay from "@/components/current-time-display"

export default function SummaryPage() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [archivedTasks, setArchivedTasks] = useState<Record<string, Record<string, boolean>>>({})
  const [weekStats, setWeekStats] = useState<{
    totalTasks: number
    completedTasks: number
    completionRate: number
    tasksByCategory: Record<string, { total: number; completed: number }>
    tasksByDay: Record<string, { total: number; completed: number }>
    streaks: {
      current: number
      longest: number
    }
    mostProductiveDay: string
    mostProductiveCategory: string
  }>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    tasksByCategory: {},
    tasksByDay: {},
    streaks: {
      current: 0,
      longest: 0,
    },
    mostProductiveDay: "",
    mostProductiveCategory: "",
  })
  const isMobile = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    // Load completed tasks from localStorage
    const savedCompletedTasks = localStorage.getItem("completedTasks")
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks))
    }

    // Load archived tasks from localStorage
    const savedArchivedTasks = localStorage.getItem("archivedTasks")
    if (savedArchivedTasks) {
      setArchivedTasks(JSON.parse(savedArchivedTasks))
    }
  }, [])

  useEffect(() => {
    if (Object.keys(completedTasks).length === 0 && Object.keys(archivedTasks).length === 0) return

    // Calculate weekly statistics
    let totalTasks = 0
    let totalCompleted = 0
    const tasksByCategory: Record<string, { total: number; completed: number }> = {}
    const tasksByDay: Record<string, { total: number; completed: number }> = {}

    // Initialize days of the week
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    days.forEach((day) => {
      tasksByDay[day] = { total: 0, completed: 0 }
    })

    // Process current tasks
    Object.entries(scheduleData.schedule).forEach(([day, tasks]) => {
      tasksByDay[day] = tasksByDay[day] || { total: 0, completed: 0 }

      tasks.forEach((task) => {
        totalTasks++
        tasksByDay[day].total++

        // Track by category
        const category = task.category || "Uncategorized"
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = { total: 0, completed: 0 }
        }
        tasksByCategory[category].total++

        // Check if task is completed
        if (completedTasks[task.id]) {
          totalCompleted++
          tasksByCategory[category].completed++
          tasksByDay[day].completed++
        }
      })
    })

    // Process archived tasks (for streaks and historical data)
    const dateKeys = Object.keys(archivedTasks).sort()
    let currentStreak = 0
    let longestStreak = 0
    let streakActive = true

    // Calculate streaks (days with at least 50% completion rate)
    for (let i = dateKeys.length - 1; i >= 0; i--) {
      const dateKey = dateKeys[i]
      const date = new Date(dateKey)
      const dayName = getDayName(date)
      const dayTasks = scheduleData.schedule[dayName as keyof typeof scheduleData.schedule] || []

      const dayCompletedTasks = Object.keys(archivedTasks[dateKey]).length
      const dayCompletionRate = dayTasks.length > 0 ? dayCompletedTasks / dayTasks.length : 0

      if (dayCompletionRate >= 0.5) {
        currentStreak = streakActive ? currentStreak + 1 : 1
        streakActive = true
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        streakActive = false
        currentStreak = 0
      }
    }

    // Find most productive day and category
    let mostProductiveDay = ""
    let highestDayRate = 0

    Object.entries(tasksByDay).forEach(([day, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0
      if (rate > highestDayRate) {
        highestDayRate = rate
        mostProductiveDay = day
      }
    })

    let mostProductiveCategory = ""
    let highestCategoryRate = 0

    Object.entries(tasksByCategory).forEach(([category, stats]) => {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0
      if (rate > highestCategoryRate && stats.total > 3) {
        // Only consider categories with more than 3 tasks
        highestCategoryRate = rate
        mostProductiveCategory = category
      }
    })

    setWeekStats({
      totalTasks,
      completedTasks: totalCompleted,
      completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
      tasksByCategory,
      tasksByDay,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
      mostProductiveDay,
      mostProductiveCategory,
    })
  }, [completedTasks, archivedTasks])

  // Get current day's completion rate
  const today = getDayName(new Date())
  const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
  const todayCompleted = todayTasks.filter((task) => completedTasks[task.id]).length
  const todayCompletionRate = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Weekly Summary</h1>
          
        </div>
        <CurrentTimeDisplay />

        <div className="space-y-4 md:space-y-6">
          {/* Today's Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-500" />
              Today's Progress
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-medium">{today}</span>
            </div>

            <div className="mb-2 flex justify-between">
              <span>Completion Rate</span>
              <span className="font-medium">
                {todayCompleted} / {todayTasks.length} tasks ({todayCompletionRate.toFixed(0)}%)
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${todayCompletionRate}%` }}
              ></div>
            </div>

            {todayCompletionRate === 100 && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300 text-sm">
                <Award className="h-4 w-4 inline mr-1" />
                Congratulations! You've completed all tasks for today.
              </div>
            )}
          </div>

          {/* Weekly Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-500" />
              Weekly Overview
            </h2>

            <div className="mb-2 flex justify-between">
              <span>Overall Completion</span>
              <span className="font-medium">
                {weekStats.completedTasks} / {weekStats.totalTasks} tasks ({weekStats.completionRate.toFixed(0)}%)
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${weekStats.completionRate}%` }}
              ></div>
            </div>

            {/* Streaks */}
            <div className="mb-6 p-3 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-base md:text-lg mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Streaks & Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {weekStats.streaks.current} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {weekStats.streaks.longest} days
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {weekStats.mostProductiveDay || "Not enough data"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Most Productive Category</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {weekStats.mostProductiveCategory || "Not enough data"}
                  </p>
                </div>
              </div>
            </div>

            {/* By Day */}
            <h3 className="font-medium text-base md:text-lg mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              By Day
            </h3>
            <div className="space-y-3 md:space-y-4 mb-6">
              {Object.entries(weekStats.tasksByDay).map(([day, stats]) => {
                const dayCompletionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

                return (
                  <div key={day}>
                    <div className="mb-1 flex justify-between">
                      <span>{isMobile ? day.substring(0, 3) : day}</span>
                      <span className="font-medium">
                        {stats.completed} / {stats.total} ({dayCompletionRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${dayCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* By Category */}
            <h3 className="font-medium text-base md:text-lg mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              By Category
            </h3>
            <div className="space-y-3 md:space-y-4">
              {Object.entries(weekStats.tasksByCategory).map(([category, stats]) => {
                const categoryCompletionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between">
                      <span>{category}</span>
                      <span className="font-medium">
                        {stats.completed} / {stats.total} ({categoryCompletionRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${getCategoryColorClass(category)}`}
                        style={{ width: `${categoryCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryColorClass(category: string): string {
  switch (category.toLowerCase()) {
    case "inner mastery":
      return "bg-purple-500"
    case "outer mastery":
      return "bg-blue-500"
    case "work":
      return "bg-amber-500"
    case "break":
      return "bg-green-500"
    case "routine":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}
