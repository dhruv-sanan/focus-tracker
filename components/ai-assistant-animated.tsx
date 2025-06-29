"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Sparkles,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Edit,
  RotateCcw,
  Plus,
  Database,
  Clock,
  Zap,
  Heart,
  Brain,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import CurrentTimeDisplay from "@/components/current-time-display"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface SuggestionBox {
  id: string
  title: string
  description: string
  category: "productivity" | "emotional" | "learning" | "routine"
  icon: React.ReactNode
}

interface RecentActivity {
  id: string
  title: string
  timestamp: Date
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to AI Assistant! 🎉",
    description: "Let's take a quick tour to help you get the most out of your AI companion.",
    target: "welcome",
    position: "bottom",
  },
  {
    id: "input",
    title: "Ask anything",
    description:
      "Type your questions or requests here. I can help with productivity, learning, emotional support, and more!",
    target: "main-input",
    position: "top",
  },
  {
    id: "suggestions",
    title: "Quick start suggestions",
    description: "Click on any of these cards to get started with common tasks and workflows.",
    target: "suggestions",
    position: "top",
  },
  {
    id: "categories",
    title: "Filter by category",
    description: "Use these filters to find suggestions that match what you're looking for.",
    target: "categories",
    position: "bottom",
  },
  {
    id: "recent",
    title: "Recent searches",
    description: "Quickly access your previous conversations and continue where you left off.",
    target: "recent-searches",
    position: "top",
  },
  {
    id: "data-toggle",
    title: "Use your data",
    description: "Toggle this to let me access your personal data for more personalized responses.",
    target: "data-toggle",
    position: "top",
  },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")
  const [useData, setUseData] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [userName, setUserName] = useState("Dhruv")
  const [activeCategory, setActiveCategory] = useState<string | null>("productivity")

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom" | "left" | "right">("bottom")

  // Animation controls
  const headerControls = useAnimation()
  const inputControls = useAnimation()
  const suggestionsControls = useAnimation()

  // Recent activity - would normally be loaded from storage/API
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      title: "How to improve my focus during work",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "2",
      title: "Create a weekly meal plan",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: "3",
      title: "Help me with time management",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      id: "4",
      title: "Design a morning routine",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    },
    {
      id: "5",
      title: "Brainstorm project ideas",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
    },
    {
      id: "6",
      title: "Learn about productivity techniques",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
    },
    {
      id: "7",
      title: "Plan weekend activities",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168), // 1 week ago
    },
    {
      id: "8",
      title: "Review monthly goals",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 240), // 10 days ago
    },
  ])

  const suggestions: SuggestionBox[] = [
    {
      id: "1",
      title: "Daily planning assistant",
      description: "Help me organize my day for maximum productivity",
      category: "productivity",
      icon: <Clock className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "2",
      title: "Emotional check-in",
      description: "Guide me through processing my feelings today",
      category: "emotional",
      icon: <Heart className="h-4 w-4 text-rose-500" />,
    },
    {
      id: "3",
      title: "Learning companion",
      description: "Help me understand a complex topic step by step",
      category: "learning",
      icon: <Brain className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "4",
      title: "Habit tracker setup",
      description: "Create a system to build consistent routines",
      category: "routine",
      icon: <Zap className="h-4 w-4 text-amber-500" />,
    },
    {
      id: "5",
      title: "Focus session",
      description: "Guide me through a productive work sprint",
      category: "productivity",
      icon: <Clock className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "6",
      title: "Mindfulness practice",
      description: "Lead me through a calming meditation",
      category: "emotional",
      icon: <Heart className="h-4 w-4 text-rose-500" />,
    },
  ]

  const categories = [
    { id: "productivity", name: "Productivity", icon: <Clock className="h-4 w-4" /> },
    { id: "emotional", name: "Emotional Support", icon: <Heart className="h-4 w-4" /> },
    { id: "learning", name: "Learning", icon: <Brain className="h-4 w-4" /> },
    { id: "routine", name: "Routines", icon: <Zap className="h-4 w-4" /> },
  ]

  const currentStep = onboardingSteps[currentOnboardingStep]

  // Check if user has completed onboarding before
  useEffect(() => {
    const completed = localStorage.getItem("ai-assistant-onboarding-completed")
    if (completed) {
      setShowOnboarding(false)
      setHasCompletedOnboarding(true)
    }
  }, [])

  // Initial animations
  useEffect(() => {
    if (!showOnboarding && hasCompletedOnboarding) {
      // Start with hidden state and animate in
      headerControls.set({ opacity: 0, y: -20 })
      inputControls.set({ opacity: 0, y: 40 })
      suggestionsControls.set({ opacity: 0, y: 40 })

      // Trigger welcome animations
      headerControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      })

      inputControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
      })

      suggestionsControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, delay: 0.4, ease: "easeOut" },
      })
    } else {
      // During onboarding, show components normally
      headerControls.set({ opacity: 1, y: 0 })
      inputControls.set({ opacity: 1, y: 0 })
      suggestionsControls.set({ opacity: 1, y: 0 })
    }
  }, [showOnboarding, hasCompletedOnboarding, headerControls, inputControls, suggestionsControls])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  useEffect(() => {
    // Add global keyboard shortcut to focus input
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // Skip onboarding with Escape
      if (e.key === "Escape" && showOnboarding) {
        handleSkipOnboarding()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showOnboarding])

  useEffect(() => {
    if (showOnboarding) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        calculateTooltipPosition(currentStep.target)
      }, 100)

      // Recalculate on window resize
      const handleResize = () => calculateTooltipPosition(currentStep.target)
      window.addEventListener("resize", handleResize)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [showOnboarding, currentOnboardingStep])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSuggestionClick = (suggestion: SuggestionBox) => {
    setInput(`${suggestion.title}: ${suggestion.description}`)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleRecentActivityClick = (activity: RecentActivity) => {
    setInput(activity.title)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentStreamingMessage("")
    setInput("")
    setIsLoading(false)
    setIsStreaming(false)
  }

  const toggleUseData = () => {
    setUseData(!useData)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const calculateTooltipPosition = (targetId: string) => {
    const targetElement =
      document.getElementById(targetId) || document.querySelector(`[data-onboarding-target="${targetId}"]`)

    if (!targetElement) {
      // Fallback to center if element not found
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      })
      setArrowPosition("bottom")
      return
    }

    const rect = targetElement.getBoundingClientRect()
    const tooltipWidth = 384 // max-w-sm = 384px
    const tooltipHeight = 200 // approximate height
    const padding = 16

    let top = 0
    let left = 0
    let arrow: "top" | "bottom" | "left" | "right" = "bottom"

    // Calculate position based on target element and available space
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceLeft = rect.left
    const spaceRight = window.innerWidth - rect.right

    // Determine best position
    if (spaceBelow >= tooltipHeight + padding) {
      // Position below
      top = rect.bottom + padding
      left = Math.max(
        padding,
        Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding),
      )
      arrow = "top"
    } else if (spaceAbove >= tooltipHeight + padding) {
      // Position above
      top = rect.top - tooltipHeight - padding
      left = Math.max(
        padding,
        Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding),
      )
      arrow = "bottom"
    } else if (spaceRight >= tooltipWidth + padding) {
      // Position to the right
      top = Math.max(
        padding,
        Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding),
      )
      left = rect.right + padding
      arrow = "left"
    } else if (spaceLeft >= tooltipWidth + padding) {
      // Position to the left
      top = Math.max(
        padding,
        Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding),
      )
      left = rect.left - tooltipWidth - padding
      arrow = "right"
    } else {
      // Center as fallback
      top = window.innerHeight / 2 - tooltipHeight / 2
      left = window.innerWidth / 2 - tooltipWidth / 2
      arrow = "bottom"
    }

    setTooltipPosition({ top, left })
    setArrowPosition(arrow)
  }

  // Onboarding functions
  const handleNextOnboardingStep = () => {
    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setCurrentOnboardingStep(currentOnboardingStep + 1)
    } else {
      handleCompleteOnboarding()
    }
  }

  const handlePrevOnboardingStep = () => {
    if (currentOnboardingStep > 0) {
      setCurrentOnboardingStep(currentOnboardingStep - 1)
    }
  }

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem("ai-assistant-onboarding-completed", "true")

    // Trigger welcome animations after a brief delay
    setTimeout(() => {
      // Set initial hidden state
      headerControls.set({ opacity: 0, y: -20 })
      inputControls.set({ opacity: 0, y: 40 })
      suggestionsControls.set({ opacity: 0, y: 40 })

      // Animate in
      headerControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      })

      inputControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
      })

      suggestionsControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, delay: 0.4, ease: "easeOut" },
      })
    }, 300)
  }

  const handleSkipOnboarding = () => {
    handleCompleteOnboarding()
  }

  const handleRestartOnboarding = () => {
    setShowOnboarding(true)
    setCurrentOnboardingStep(0)
    setHasCompletedOnboarding(false)

    // Reset animation controls
    headerControls.set({ opacity: 1, y: 0 })
    inputControls.set({ opacity: 1, y: 0 })
    suggestionsControls.set({ opacity: 1, y: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    // Add to recent activity
    const newActivity = {
      id: Date.now().toString(),
      title: input.trim(),
      timestamp: new Date(),
    }
    setRecentActivity([newActivity, ...recentActivity.slice(0, 4)])

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)
    setCurrentStreamingMessage("")

    try {
      const response = await fetch("/ai-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-5), // Send last 5 messages for context
          useData: useData,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedContent += data.content
                setCurrentStreamingMessage(accumulatedContent)
              }
            } catch (error) {
              console.error("Error parsing streaming data:", error)
            }
          }
        }
      }

      // Add the complete assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: accumulatedContent,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentStreamingMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const hasMessages = messages.length > 0 || isStreaming
  const filteredSuggestions = activeCategory ? suggestions.filter((s) => s.category === activeCategory) : suggestions

  // Pulse animation for onboarding button to draw attention
  useEffect(() => {
    if (!showOnboarding && hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        // Add a subtle pulse to the help button after 3 seconds
        const helpButton = document.querySelector('[title="Restart Tutorial"]')
        if (helpButton) {
          helpButton.classList.add("animate-pulse")
          setTimeout(() => {
            helpButton.classList.remove("animate-pulse")
          }, 2000)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showOnboarding, hasCompletedOnboarding])

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Onboarding Tooltip */}
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border p-6 max-w-sm"
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              {/* Arrow indicator */}
              <div
                className={cn(
                  "absolute w-3 h-3 bg-white dark:bg-gray-900 border rotate-45",
                  arrowPosition === "top" && "-top-1.5 left-1/2 transform -translate-x-1/2 border-b-0 border-r-0",
                  arrowPosition === "bottom" && "-bottom-1.5 left-1/2 transform -translate-x-1/2 border-t-0 border-l-0",
                  arrowPosition === "left" && "-left-1.5 top-1/2 transform -translate-y-1/2 border-t-0 border-r-0",
                  arrowPosition === "right" && "-right-1.5 top-1/2 transform -translate-y-1/2 border-b-0 border-l-0",
                )}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{currentStep.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSkipOnboarding} className="h-8 w-8 -mt-1 -mr-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentOnboardingStep ? "bg-primary" : "bg-muted",
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentOnboardingStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrevOnboardingStep}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNextOnboardingStep}>
                    {currentOnboardingStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                    {currentOnboardingStep < onboardingSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 1, y: 0 }}
        animate={headerControls}
        className="flex items-center justify-between p-6 border-b"
      >
        <div className="flex items-center space-x-4">
          <motion.h1
            className="text-xl font-semibold flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            AI Assistant
          </motion.h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Onboarding Restart Button */}
          <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                    <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestartOnboarding}
              className="h-9 w-9 relative group"
              title="Restart Tutorial"
              data-onboarding-target="restart-tutorial"
            >
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6, ease: "easeInOut" }}>
                <HelpCircle className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Restart Tutorial</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <CurrentTimeDisplay />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {!hasMessages ? (
          // Initial state with centered input and suggestions
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
            <motion.div
              className="text-center mb-8"
              id="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <motion.h2
                className="text-2xl font-semibold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Hey {userName}! 👋 How can I help you today?
              </motion.h2>
            </motion.div>

            {/* Centered Input */}
            <motion.div
              className="w-full max-w-4xl mb-8"
              id="main-input"
              data-onboarding-target="main-input"
              initial={{ opacity: 1, y: 0 }}
              animate={inputControls}
            >
              <motion.div
                className="bg-muted/30 rounded-3xl p-6 border"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="relative mb-4">
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything"
                        disabled={isLoading}
                        className="w-full h-16 pl-4 pr-4 rounded-2xl border-0 text-lg bg-background/50 focus:bg-background transition-all duration-200"
                      />
                    </motion.div>
                  </div>

                  {/* Buttons inside the box */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Recent Searches Dropdown */}
                      {recentActivity.length > 0 && (
                        <motion.div
                          id="recent-searches"
                          data-onboarding-target="recent-searches"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-sm h-10 px-4 rounded-full"
                              >
                                <History className="h-4 w-4" />
                                Recent searches
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 max-w-sm" align="start">
                              <div className="max-h-80 overflow-y-auto">
                                {recentActivity.map((activity, index) => (
                                  <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <DropdownMenuItem
                                      className="cursor-pointer py-3 px-3 flex items-center justify-between"
                                      onClick={() => handleRecentActivityClick(activity)}
                                    >
                                      <div className="text-sm truncate max-w-[80%]">{activity.title}</div>
                                      <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                        {formatTimeAgo(activity.timestamp)}
                                      </div>
                                    </DropdownMenuItem>
                                  </motion.div>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      )}

                      {/* Use Data Button */}
                      <motion.div
                        id="data-toggle"
                        data-onboarding-target="data-toggle"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant={useData ? "default" : "ghost"}
                          className={cn(
                            "h-10 px-4 rounded-full transition-all duration-200 flex items-center gap-2",
                            useData && "bg-primary text-primary-foreground",
                          )}
                          onClick={toggleUseData}
                        >
                          <Database className="h-4 w-4" />
                          use data
                        </Button>
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                    <Mic className="h-4 w-4" />
                                </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Dictate</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button type="submit" disabled={isLoading || !input.trim()} className="h-10 w-10 rounded-full">
                                <Plus className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>New Chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                      
                    </div>
                  </div>
                </form>
              </motion.div>

              <motion.div
                className="flex items-center justify-center py-3 gap-4 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↵</kbd>
                  <span>to focus</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              className="w-full max-w-4xl mb-4"
              id="categories"
              data-onboarding-target="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Get started with:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={activeCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    >
                      <span className="flex items-center gap-1">
                        {category.icon}
                        {category.name}
                      </span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              className="w-full max-w-4xl mb-8"
              id="suggestions"
              data-onboarding-target="suggestions"
              initial={{ opacity: 1, y: 0 }}
              animate={suggestionsControls}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-4 text-left rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <motion.div whileHover={{ rotate: 10 }} transition={{ duration: 0.2 }}>
                          {suggestion.icon}
                        </motion.div>
                        <div className="font-medium">{suggestion.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-6">{suggestion.description}</div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ) : (
          // Chat view with messages
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Welcome message */}
                <motion.div
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-lg">Hey {userName}! 👋 How can I help you today?</div>
                </motion.div>

                {/* Action buttons for first message */}
                {messages.length > 0 && (
                  <motion.div
                    className="flex items-center gap-2 ml-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[
                      { icon: Copy, label: "Copy" },
                      { icon: ThumbsUp, label: "Like" },
                      { icon: ThumbsDown, label: "Dislike" },
                      { icon: Volume2, label: "Read aloud" },
                      { icon: Edit, label: "Edit" },
                      { icon: RotateCcw, label: "Regenerate" },
                    ].map((action, index) => (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button variant="ghost" size="sm">
                          <action.icon className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Messages */}
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Streaming Message */}
                <AnimatePresence>
                  {isStreaming && currentStreamingMessage && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted mr-12">
                        <p className="text-sm whitespace-pre-wrap">{currentStreamingMessage}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 bg-current rounded-full"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Bottom Input */}
            <motion.div
              className="border-t p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="max-w-4xl mx-auto">
                <motion.div
                  className="bg-muted/30 rounded-3xl p-6 border"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit}>
                    <div className="relative mb-4">
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask anything"
                          disabled={isLoading}
                          className="w-full h-16 pl-4 pr-4 rounded-2xl border-0 text-lg bg-background/50 focus:bg-background transition-all duration-200"
                        />
                      </motion.div>
                    </div>

                    {/* Buttons inside the box */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Recent Searches Dropdown */}
                        {recentActivity.length > 0 && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-2 text-sm h-10 px-4 rounded-full"
                                >
                                  <History className="h-4 w-4" />
                                  Recent searches
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-80 max-w-sm" align="start">
                                <div className="max-h-80 overflow-y-auto">
                                  {recentActivity.map((activity, index) => (
                                    <motion.div
                                      key={activity.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <DropdownMenuItem
                                        className="cursor-pointer py-3 px-3 flex items-center justify-between"
                                        onClick={() => handleRecentActivityClick(activity)}
                                      >
                                        <div className="text-sm truncate max-w-[80%]">{activity.title}</div>
                                        <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                          {formatTimeAgo(activity.timestamp)}
                                        </div>
                                      </DropdownMenuItem>
                                    </motion.div>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        )}

                        {/* Use Data Button */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            type="button"
                            variant={useData ? "default" : "ghost"}
                            className={cn(
                              "h-10 px-4 rounded-full transition-all duration-200 flex items-center gap-2",
                              useData && "bg-primary text-primary-foreground",
                            )}
                            onClick={toggleUseData}
                          >
                            <Database className="h-4 w-4" />
                            use data
                          </Button>
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <Mic className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-10 w-10 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
