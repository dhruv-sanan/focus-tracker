"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Target, Award, Clock, Activity, Zap, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import CurrentTimeDisplay from "@/components/current-time-display"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"

interface TaskStats {
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
}

interface DailyProgress {
  date: string
  completed: number
  total: number
  rate: number
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [weekStats, setWeekStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    tasksByCategory: {},
    tasksByDay: {},
    streaks: { current: 0, longest: 0 },
    mostProductiveDay: "",
    mostProductiveCategory: "",
  })
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0, rate: 0 })
  const { toast } = useToast()
  const router = useRouter()

  // Mock schedule data - replace with your actual data source
  const scheduleData = {
    schedule: {
      Monday: [
        { id: "1", category: "Inner Mastery", task: "Morning meditation" },
        { id: "2", category: "Work", task: "Team standup" },
        { id: "3", category: "Outer Mastery", task: "Exercise" },
      ],
      Tuesday: [
        { id: "4", category: "Work", task: "Project review" },
        { id: "5", category: "Inner Mastery", task: "Reading" },
      ],
      Wednesday: [
        { id: "6", category: "Outer Mastery", task: "Gym session" },
        { id: "7", category: "Work", task: "Client meeting" },
        { id: "8", category: "Break", task: "Lunch break" },
      ],
      Thursday: [
        { id: "9", category: "Inner Mastery", task: "Journaling" },
        { id: "10", category: "Work", task: "Code review" },
      ],
      Friday: [
        { id: "11", category: "Work", task: "Weekly planning" },
        { id: "12", category: "Outer Mastery", task: "Skill practice" },
        { id: "13", category: "Break", task: "Social time" },
      ],
      Saturday: [
        { id: "14", category: "Routine", task: "House cleaning" },
        { id: "15", category: "Break", task: "Hobby time" },
      ],
      Sunday: [
        { id: "16", category: "Inner Mastery", task: "Reflection" },
        { id: "17", category: "Routine", task: "Meal prep" },
      ],
    },
  }

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true)

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Load data from localStorage (replace with your actual data loading logic)
        const completedTasks = JSON.parse(localStorage.getItem("completedTasks") || "{}")
        const archivedTasks = JSON.parse(localStorage.getItem("archivedTasks") || "{}")

        // Calculate statistics
        const stats = calculateWeeklyStats(completedTasks, archivedTasks)
        setWeekStats(stats)

        // Calculate daily progress for the last 7 days
        const daily = calculateDailyProgress(completedTasks, archivedTasks)
        setDailyProgress(daily)

        // Calculate today's stats
        const today = calculateTodayStats(completedTasks)
        setTodayStats(today)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading analytics data:", error)
        toast({
          title: "Error loading analytics",
          description: "There was a problem loading your analytics data.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [toast])

  const calculateWeeklyStats = (
    completedTasks: Record<string, boolean>,
    archivedTasks: Record<string, Record<string, boolean>>,
  ): TaskStats => {
    let totalTasks = 0
    let totalCompleted = 0
    const tasksByCategory: Record<string, { total: number; completed: number }> = {}
    const tasksByDay: Record<string, { total: number; completed: number }> = {}

    // Initialize days
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    days.forEach((day) => {
      tasksByDay[day] = { total: 0, completed: 0 }
    })

    // Process current week's tasks
    Object.entries(scheduleData.schedule).forEach(([day, tasks]) => {
      tasks.forEach((task) => {
        totalTasks++
        tasksByDay[day].total++

        const category = task.category || "Uncategorized"
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = { total: 0, completed: 0 }
        }
        tasksByCategory[category].total++

        if (completedTasks[task.id]) {
          totalCompleted++
          tasksByCategory[category].completed++
          tasksByDay[day].completed++
        }
      })
    })

    // Calculate streaks and find most productive day/category
    const mostProductiveDay =
      Object.entries(tasksByDay)
        .filter(([, stats]) => stats.total > 0)
        .sort(([, a], [, b]) => b.completed / b.total - a.completed / a.total)[0]?.[0] || ""

    const mostProductiveCategory =
      Object.entries(tasksByCategory)
        .filter(([, stats]) => stats.total > 2)
        .sort(([, a], [, b]) => b.completed / b.total - a.completed / a.total)[0]?.[0] || ""

    return {
      totalTasks,
      completedTasks: totalCompleted,
      completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
      tasksByCategory,
      tasksByDay,
      streaks: { current: 3, longest: 7 }, // Mock data
      mostProductiveDay,
      mostProductiveCategory,
    }
  }

  const calculateDailyProgress = (
    completedTasks: Record<string, boolean>,
    archivedTasks: Record<string, Record<string, boolean>>,
  ): DailyProgress[] => {
    const progress: DailyProgress[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dayName = format(date, "EEEE")
      const dayTasks = scheduleData.schedule[dayName as keyof typeof scheduleData.schedule] || []

      const completed = dayTasks.filter((task) => completedTasks[task.id]).length
      const total = dayTasks.length
      const rate = total > 0 ? (completed / total) * 100 : 0

      progress.push({
        date: format(date, "MMM d"),
        completed,
        total,
        rate,
      })
    }

    return progress
  }

  const calculateTodayStats = (completedTasks: Record<string, boolean>) => {
    const today = format(new Date(), "EEEE")
    const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
    const completed = todayTasks.filter((task) => completedTasks[task.id]).length
    const total = todayTasks.length
    const rate = total > 0 ? (completed / total) * 100 : 0

    return { completed, total, rate }
  }

  const getCategoryColor = (category: string): string => {
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
        return "bg-slate-500"
    }
  }

  const getStreakBadgeVariant = (streak: number) => {
    if (streak >= 7) return "default"
    if (streak >= 3) return "secondary"
    return "outline"
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <PageHeader
        title="Analytics Dashboard"
        icon={<BarChart className="h-6 w-6" />}
      />

      <div className="flex flex-col space-y-6">
        {/* Today's Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Progress
            </h2>
            <Badge variant={todayStats.rate === 100 ? "default" : "secondary"}>{format(new Date(), "EEEE")}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-medium">
                {todayStats.completed} / {todayStats.total} tasks ({todayStats.rate.toFixed(0)}%)
              </span>
            </div>

            <Progress value={todayStats.rate} className="h-3" />

            {todayStats.rate === 100 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Perfect day! All tasks completed.</span>
              </div>
            )}
          </div>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">
              Trends
              <Badge variant="outline" className="ml-2">
                7 days
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Stats */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Overview
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Completion</span>
                  <span className="font-medium">
                    {weekStats.completedTasks} / {weekStats.totalTasks} tasks ({weekStats.completionRate.toFixed(0)}%)
                  </span>
                </div>

                <Progress value={weekStats.completionRate} className="h-3" />
              </div>

              <Separator className="my-6" />

              {/* By Day */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Daily Breakdown
                </h3>

                {Object.entries(weekStats.tasksByDay).map(([day, stats]) => {
                  const dayRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                  return (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{day}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.completed} / {stats.total} ({dayRate.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={dayRate} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Category Performance
              </h2>

              <div className="space-y-4">
                {Object.entries(weekStats.tasksByCategory).map(([category, stats]) => {
                  const categoryRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {stats.completed} / {stats.total} ({categoryRate.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={categoryRate} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Daily Progress Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                7-Day Progress Trend
              </h2>

              <div className="space-y-4">
                {dailyProgress.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.date}</span>
                      <span className="text-sm text-muted-foreground">
                        {day.completed} / {day.total} ({day.rate.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={day.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Streaks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Streaks & Momentum
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">{weekStats.streaks.current}</span>
                    <Badge variant={getStreakBadgeVariant(weekStats.streaks.current)}>days</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">{weekStats.streaks.longest}</span>
                    <Badge variant="outline">days</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Key Insights */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Key Insights
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Most Productive Day</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {weekStats.mostProductiveDay || "Not enough data yet"} - Keep up the momentum on this day!
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Top Category</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {weekStats.mostProductiveCategory || "Not enough data yet"} - You're excelling in this area!
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Weekly Performance</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {weekStats.completionRate >= 80
                      ? "Excellent work! You're maintaining high productivity."
                      : weekStats.completionRate >= 60
                        ? "Good progress! Consider focusing on consistency."
                        : "Room for improvement. Try breaking tasks into smaller steps."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recommendations</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">
                    Focus on maintaining consistency in your {weekStats.mostProductiveCategory.toLowerCase()} tasks.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">
                    Try to replicate your {weekStats.mostProductiveDay} success pattern on other days.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">Consider breaking down larger tasks into smaller, manageable chunks.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
