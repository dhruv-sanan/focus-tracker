"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, ArrowLeft, Trash2, Bell, BellOff, Settings, Palette, Smartphone } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurrentTimeDisplay from "@/components/current-time-display"
import scheduleData from "@/data/schedule.json"
import { getDayName } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const notifEnabled = localStorage.getItem("notificationsEnabled") === "true"
    setNotificationsEnabled(notifEnabled)
  }, [])

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      })
      return
    }

    // Request permission for notifications
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      })
      return
    }

    setNotificationsEnabled(true)
    localStorage.setItem("notificationsEnabled", "true")

    // Register the service worker
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/sw.js")
      const registration = await navigator.serviceWorker.ready

      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications for task transitions.",
      })

      registration.showNotification("Test Notification", {
        body: "This is a test notification to verify setup.",
        icon: "/favicon.ico",
      })

      const audio = new Audio("/notification.mp3")
      audio.play().catch(() => {
        console.warn("Unable to play notification sound")
      })
    }
  }

  const handleDisableNotifications = async () => {
    setNotificationsEnabled(false)
    localStorage.setItem("notificationsEnabled", "false")

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      registrations.forEach((registration) => registration.unregister())
    }

    toast({
      title: "Notifications Disabled",
      description: "You won't receive notifications for task transitions.",
    })
  }

  const handleResetToday = () => {
    const today = getDayName(new Date())
    const todayTasks = scheduleData.schedule[today as keyof typeof scheduleData.schedule] || []
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks") || "{}")

    todayTasks.forEach((task) => {
      delete completedTasks[task.id]
    })

    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))

    toast({
      title: "Today's Tasks Reset",
      description: `All tasks for ${today} have been reset.`,
    })
  }

  const handleResetAllTasks = () => {
    localStorage.setItem("completedTasks", JSON.stringify({}))
    toast({
      title: "All Tasks Reset",
      description: "Completed tasks for all days have been cleared.",
    })
  }

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Handle loading state
  if (!mounted) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <PageHeader title="Settings" icon={<Settings className="h-6 w-6" />} />

      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Theme Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Color Theme</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Task Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive notifications when tasks are due or when it's time to transition between activities.
                  </p>

                  {notificationsEnabled ? (
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleDisableNotifications}>
                      <BellOff className="h-4 w-4" />
                      Disable Notifications
                    </Button>
                  ) : (
                    <Button variant="default" className="flex items-center gap-2" onClick={handleEnableNotifications}>
                      <Bell className="h-4 w-4" />
                      Enable Notifications
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Management
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Reset Task Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clear completed task data. This action cannot be undone.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handleResetToday}
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Reset Today's Tasks
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleResetAllTasks}
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Reset All Tasks
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
            <Button 
              variant="outline" 
              className="mx-auto"
              onClick={() => router.push("/")}
              >
              Return to Dashboard
            </Button>
        </div>
      </div>
    </div>
  )
}
