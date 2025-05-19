"use client"

import { useState } from "react"
import { usePomodoro } from "@/contexts/pomodoro-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipForward, RefreshCw, Coffee, Timer, SettingsIcon, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import CurrentTimeDisplay from "@/components/current-time-display"

export default function PomodoroPage() {
  const {
    status,
    timeRemaining,
    currentSession,
    totalSessions,
    settings,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
    updateSettings,
    progress,
  } = usePomodoro()

  const [activeTab, setActiveTab] = useState("timer")
  const [muted, setMuted] = useState(false)

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get status text and color
  const getStatusInfo = () => {
    switch (status) {
      case "work":
        return { text: "Focus Time", color: "text-red-500", bgColor: "bg-red-500" }
      case "shortBreak":
        return { text: "Short Break", color: "text-green-500", bgColor: "bg-green-500" }
      case "longBreak":
        return { text: "Long Break", color: "text-blue-500", bgColor: "bg-blue-500" }
      default:
        return { text: "Ready", color: "text-gray-300", bgColor: "bg-gray-500" }
    }
  }

  const statusInfo = getStatusInfo()

  const toggleMute = () => {
    const audioElements = document.querySelectorAll("audio")
    audioElements.forEach((audio) => {
      audio.muted = !muted
    })
    setMuted(!muted)
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Pomodoro Timer</h1>
        <CurrentTimeDisplay />
        
      </header>

      <div className="max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="mt-6">
            <Card className="p-6">
              <div className="flex flex-col items-center">
                {/* Status */}
                <div className={cn("text-lg font-semibold mb-4", statusInfo.color)}>{statusInfo.text}</div>

                {/* Timer Circle */}
                <div className="relative w-64 h-64 mb-8">
                  <svg className="w-full  h-full text-black dark:text-white" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />

                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={statusInfo.bgColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.PI * 90 * progress} ${Math.PI * 90 * (1 - progress)}`}
                      transform="rotate(-90 50 50)"
                    />

                    {/* Time text */}
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold"
                      fill="currentColor"
                      fontSize="16"
                    >
                      {formatTime(timeRemaining)}
                    </text>

                    {/* Session text */}
                    <text
                      x="50"
                      y="65"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm text-muted-foreground"
                      fontSize="5"
                      fill="currentColor"
                    >
                      Session {currentSession}
                    </text>
                  </svg>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button variant="outline" size="icon" onClick={resetTimer} title="Reset Timer">
                    <RefreshCw className="h-5 w-5" />
                  </Button>

                  <Button
                    size="lg"
                    className={cn(
                      "rounded-full w-16 h-16",
                      isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
                    )}
                    onClick={isActive ? pauseTimer : startTimer}
                  >
                    {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={skipToNext} title="Skip to Next">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Current Mode */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={status === "work" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (status !== "work") {
                        resetTimer()
                        updateSettings({ ...settings })
                      }
                    }}
                    className={status === "work" ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    Focus
                  </Button>

                  <Button
                    variant={status === "shortBreak" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (status !== "shortBreak") {
                        resetTimer()
                        updateSettings({ ...settings })
                        // Set to short break
                        setTimeout(() => {
                          skipToNext()
                        }, 100)
                      }
                    }}
                    className={status === "shortBreak" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    Short Break
                  </Button>

                  <Button
                    variant={status === "longBreak" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (status !== "longBreak") {
                        resetTimer()
                        // Set current session to trigger long break
                        updateSettings({ ...settings })
                        // Set to long break
                        setTimeout(() => {
                          // Manually set to long break
                          skipToNext()
                          skipToNext()
                        }, 100)
                      }
                    }}
                    className={status === "longBreak" ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    Long Break
                  </Button>
                </div>

                {/* Sound toggle */}
                <Button variant="ghost" size="sm" onClick={toggleMute} className="mt-6">
                  {muted ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                  {muted ? "Unmute Sounds" : "Mute Sounds"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Timer Settings</h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Focus Duration: {settings.workDuration} minutes</label>
                      </div>
                      <Slider
                        value={[settings.workDuration]}
                        min={5}
                        max={60}
                        step={5}
                        onValueChange={(value) => updateSettings({ workDuration: value[0] })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">
                          Short Break: {settings.shortBreakDuration} minutes
                        </label>
                      </div>
                      <Slider
                        value={[settings.shortBreakDuration]}
                        min={1}
                        max={15}
                        step={1}
                        onValueChange={(value) => updateSettings({ shortBreakDuration: value[0] })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Long Break: {settings.longBreakDuration} minutes</label>
                      </div>
                      <Slider
                        value={[settings.longBreakDuration]}
                        min={5}
                        max={30}
                        step={5}
                        onValueChange={(value) => updateSettings({ longBreakDuration: value[0] })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">
                          Sessions before Long Break: {settings.sessionsBeforeLongBreak}
                        </label>
                      </div>
                      <Slider
                        value={[settings.sessionsBeforeLongBreak]}
                        min={2}
                        max={8}
                        step={1}
                        onValueChange={(value) => updateSettings({ sessionsBeforeLongBreak: value[0] })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Preset Timers</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateSettings({
                          workDuration: 25,
                          shortBreakDuration: 5,
                          longBreakDuration: 15,
                          sessionsBeforeLongBreak: 4,
                        })
                      }
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Classic (25-5)
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        updateSettings({
                          workDuration: 50,
                          shortBreakDuration: 10,
                          longBreakDuration: 30,
                          sessionsBeforeLongBreak: 2,
                        })
                      }
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Extended (50-10)
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        updateSettings({
                          workDuration: 15,
                          shortBreakDuration: 3,
                          longBreakDuration: 15,
                          sessionsBeforeLongBreak: 4,
                        })
                      }
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Quick (15-3)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <Coffee className="h-4 w-4 mr-2" />
            Pomodoro Technique
          </h3>
          <p className="text-sm text-muted-foreground">
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals,
            traditionally 25 minutes in length, separated by short breaks. Each interval is known as a pomodoro, from
            the Italian word for tomato, after the tomato-shaped kitchen timer.
          </p>
        </div>
      </div>
    </div>
  )
}
