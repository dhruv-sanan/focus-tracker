"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Trash2, Bell, BellOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import scheduleData from "@/data/schedule.json"
import { getDayName } from "@/lib/utils"

export default function ThemePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { toast } = useToast()
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
      });
      return;
    }
  
    // Request permission for notifications
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return;
    }
  
    setNotificationsEnabled(true);
    localStorage.setItem("notificationsEnabled", "true");
  
    // **Register the service worker**
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/sw.js");
      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications for task transitions.",
      });
  
      // **Trigger test notification via Service Worker**
      registration.showNotification("Test Notification", {
        body: "This is a test notification to verify setup.",
        icon: "/favicon.ico",
      });
    }
  };
  // **Handle disabling notifications**  
  const handleDisableNotifications = async () => {
    setNotificationsEnabled(false);
    localStorage.setItem("notificationsEnabled", "false");
  
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      registrations.forEach((registration) => registration.unregister());
    }
  
    toast({
      title: "Notifications Disabled",
      description: "You won't receive notifications for task transitions.",
    });
  };
  
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
  // This avoids hydration mismatch errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">  
          <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Customize the appearance of MyFocusDash</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Color Theme</h2>
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
                <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                  System
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/">
                  <Button className="w-full sm:w-auto">
                      Return to Dashboard
                    </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white mt-6 dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
          <h2 className="text-lg font-medium mb-3">App Settings</h2>
            <div className="flex flex-wrap gap-3">
            {notificationsEnabled ? (
                <Button variant="outline" className="flex items-center gap-1" onClick={handleDisableNotifications}>
                  <BellOff className="pr-1" />
                  Disable Alerts
                </Button>
              ) : (
                <Button variant="outline" className="flex items-center gap-1" onClick={handleEnableNotifications}>
                  <Bell className="pr-1" />
                  Enable Alerts
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleResetToday}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Reset Today
              </Button>
              <Button
                variant="outline"
                onClick={handleResetAllTasks}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Reset All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
