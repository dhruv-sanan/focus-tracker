"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BookOpen, Code, Lightbulb, Headphones, Film, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/components/video-player"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import CurrentTimeDisplay from "@/components/current-time-display"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  isRecommended?: boolean
  duration: string
}

interface VideoCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  videos: Video[]
}

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const { theme } = useTheme()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Simulate fetching video categories and videos
  useEffect(() => {
    // In a real app, this would be an API call
    const videoCategories: VideoCategory[] = [
      {
        id: "productivity",
        name: "Productivity",
        icon: <Lightbulb className="h-6 w-6 text-amber-500" />,
        description: "Boost your efficiency and get more done",
        videos: [
          {
            id: "prod-1",
            title: "Time Blocking Method",
            description: "Master the time blocking technique to maximize productivity",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/1EUIQaTxaKE",
            isRecommended: true,
            duration: "15:24",
          },
          {
            id: "prod-2",
            title: "Pomodoro Technique",
            description: "Work in focused sprints with the Pomodoro method",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/VFW3Ld7JO0w",
            duration: "8:12",
          },
          {
            id: "prod-3",
            title: "Task Batching",
            description: "Group similar tasks together for maximum efficiency",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/cH-YxFRmVeo",
            duration: "12:45",
          },
          {
            id: "prod-4",
            title: "Digital Minimalism",
            description: "Reduce digital clutter and improve focus",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/jJO_x5-T9qA",
            duration: "18:30",
          },
        ],
      },
      {
        id: "meditation",
        name: "Meditation",
        icon: <Headphones className="h-6 w-6 text-emerald-500" />,
        description: "Find calm and improve mental clarity",
        videos: [
          {
            id: "med-1",
            title: "10-Minute Mindfulness",
            description: "Quick mindfulness practice for busy days",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8",
            duration: "10:00",
          },
          {
            id: "med-2",
            title: "Deep Relaxation",
            description: "Guided meditation for stress relief",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU",
            isRecommended: true,
            duration: "20:15",
          },
          {
            id: "med-3",
            title: "Morning Meditation",
            description: "Start your day with clarity and purpose",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/ENYYb5vIMkU",
            duration: "15:30",
          },
          {
            id: "med-4",
            title: "Sleep Meditation",
            description: "Calm your mind for restful sleep",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ",
            duration: "30:00",
          },
        ],
      },
      {
        id: "development",
        name: "Development",
        icon: <Code className="h-6 w-6 text-blue-500" />,
        description: "Improve your coding and development skills",
        videos: [
          {
            id: "dev-1",
            title: "React Fundamentals",
            description: "Master the basics of React development",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/w7ejDZ8SWv8",
            duration: "25:40",
          },
          {
            id: "dev-2",
            title: "Next.js Crash Course",
            description: "Build full-stack applications with Next.js",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/mTz0GXj8NN0",
            isRecommended: true,
            duration: "32:15",
          },
          {
            id: "dev-3",
            title: "CSS Grid Layout",
            description: "Create responsive layouts with CSS Grid",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/jV8B24rSN5o",
            duration: "18:22",
          },
          {
            id: "dev-4",
            title: "TypeScript Essentials",
            description: "Add type safety to your JavaScript projects",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/BCg4U1FzODs",
            duration: "22:10",
          },
        ],
      },
      {
        id: "study",
        name: "Study With Me",
        icon: <BookOpen className="h-6 w-6 text-purple-500" />,
        description: "Focus and study with virtual companions",
        videos: [
          {
            id: "study-1",
            title: "2-Hour Pomodoro Study",
            description: "Study session with timed breaks",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/1fkqoLW4LmI",
            isRecommended: true,
            duration: "2:00:00",
          },
          {
            id: "study-2",
            title: "Ambient Library Study",
            description: "Study with calming library ambience",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/lTRiuFIWV54",
            duration: "1:30:00",
          },
          {
            id: "study-3",
            title: "Lofi Study Session",
            description: "Focus with relaxing lofi beats",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
            duration: "3:00:00",
          },
          {
            id: "study-4",
            title: "Morning Productivity",
            description: "Early morning focused study session",
            thumbnail: "/placeholder.svg?height=180&width=320",
            videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
            duration: "1:45:00",
          },
        ],
      },
    ]

    setCategories(videoCategories)
    setSelectedCategory(videoCategories[0].id)
  }, [])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedVideo(null)
  }

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    // Scroll to video player
    setTimeout(() => {
      const videoPlayer = document.getElementById("video-player-section")
      if (videoPlayer) {
        videoPlayer.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleBackToVideos = () => {
    setSelectedVideo(null)
  }

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Video Resources</h1>
        <CurrentTimeDisplay />
      </header>

      {/* Category Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:border-primary",
                selectedCategory === category.id ? "border-primary bg-primary/5" : "",
              )}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-muted">{category.icon}</div>
                <h3 className="font-medium">{category.name}</h3>
                {!isMobile && <p className="text-xs text-muted-foreground">{category.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {selectedCategoryData && !selectedVideo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{selectedCategoryData.name} Videos</h2>
            <p className="text-sm text-muted-foreground">{selectedCategoryData.videos.length} videos available</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedCategoryData.videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden cursor-pointer hover:border-primary transition-all duration-200"
                onClick={() => handleVideoSelect(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  {video.isRecommended && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary hover:bg-primary">Recommended</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Video Player */}
      {selectedVideo && (
        <div id="video-player-section" className="space-y-4">
          <Button variant="ghost" className="flex items-center gap-2 mb-2 pl-2" onClick={handleBackToVideos}>
            <ArrowLeft className="h-4 w-4" />
            Back to videos
          </Button>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                  {selectedVideo.isRecommended && <Badge className="bg-primary hover:bg-primary">Recommended</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedCategoryData?.name}</Badge>
                <Badge variant="outline">{selectedVideo.duration}</Badge>
              </div>
            </div>
            <Separator />
            <div className="aspect-video w-full">
              <VideoPlayer videoUrl={selectedVideo.videoUrl} />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCategoryData && !selectedVideo && (
        <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
          <div className="text-center max-w-md p-6">
            <Film className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Select a category</h2>
            <p className="text-muted-foreground">
              Choose from our curated collection of videos to enhance your productivity, learning, and wellbeing
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
