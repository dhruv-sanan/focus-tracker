"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Code,
  Lightbulb,
  Headphones,
  Film,
  ArrowLeft,
  Edit,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Globe,
  ExternalLink,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/components/video-player" // Assuming this component is correctly set up
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/page-header"

// --- Helper Functions for YouTube Thumbnails ---

/**
 * Extracts the YouTube video ID from various URL formats.
 * @param url The YouTube video URL.
 * @returns The video ID string, or null if not found.
 */
function getYoutubeVideoId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Generates a YouTube thumbnail URL.
 * @param videoId The YouTube video ID.
 * @param quality The desired thumbnail quality.
 * 'mqdefault' (320x180) is good for lists.
 * 'hqdefault' (480x360) for higher quality.
 * 'sddefault' (640x480) for standard definition.
 * 'maxresdefault' (1920x1080 or 1280x720) for highest available.
 * @returns The thumbnail URL string.
 */
function getYoutubeThumbnailUrl(
  videoId: string,
  quality: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault" = "mqdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Extracts the favicon URL from a website URL.
 * @param url The website URL.
 * @returns The favicon URL string.
 */
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
  } catch (error) {
    return "/placeholder.svg?height=32&width=32&text=Icon"
  }
}

/**
 * Extracts the domain name from a URL.
 * @param url The website URL.
 * @returns The domain name string.
 */
function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, "")
  } catch (error) {
    return url
  }
}

// --- Interfaces ---

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string // This will be populated dynamically
  videoUrl: string
  isRecommended?: boolean
  duration: string
}

interface Website {
  id: string
  title: string
  description: string
  websiteUrl: string
  favicon: string // This will be populated dynamically
  isRecommended?: boolean
  addedOn: string
}

interface VideoCategory {
  id: string
  name: string
  icon: React.ReactNode
  iconId: string
  description: string
  videos: Video[] // Videos will have their thumbnails processed
}

interface WebsiteCategory {
  id: string
  name: string
  icon: React.ReactNode
  iconId: string
  description: string
  websites: Website[] // Websites will have their favicons processed
}

// --- Default Data ---
const getDefaultVideoCategories = (): VideoCategory[] => [
  {
    id: "productivity-videos",
    name: "Productivity",
    icon: <Lightbulb className="h-6 w-6 text-amber-500" />,
    iconId: "lightbulb",
    description: "Boost your efficiency and get more done",
    videos: [
      {
        id: "prod-1",
        title: "Focus Toolkit",
        description: "Tools to Improve Your Focus by Andrew Huberman",
        videoUrl: "https://www.youtube.com/embed/yb5zpo5WDG4", // Example YouTube URL
        isRecommended: true,
        duration: "1:51:31",
        thumbnail: "", // Will be populated
      },
      {
        id: "prod-2",
        title: "Motivation Explain by Dr. K",
        description: "What People Don't Get About Motivation",
        videoUrl: "https://www.youtube.com/watch?v=3QWIxElEnc8", // Example YouTube URL
        duration: "33:23",
        thumbnail: "", // Will be populated
      },
      {
        id: "prod-3",
        title: "Task Batching",
        description: "Group similar tasks together for maximum efficiency",
        videoUrl: "https://www.youtube.com/watch?v=ua2L2Qf5cSY", // Example YouTube URL
        duration: "12:45",
        thumbnail: "", // Will be populated
      },
    ],
  },
  {
    id: "meditation-videos",
    name: "Meditation",
    icon: <Headphones className="h-6 w-6 text-emerald-500" />,
    iconId: "headphones",
    description: "Find calm and improve mental clarity",
    videos: [
      {
        id: "med-1",
        title: "Introduction to Anapana",
        description: "Introduction to Anapana for All - Hindi by S.N. Goenka",
        videoUrl: "https://www.youtube.com/watch?v=byyz8FAvSsE", // Example YouTube URL
        isRecommended: true,
        duration: "19:54",
        thumbnail: "", // Will be populated
      },
      {
        id: "med-2",
        title: "Anapana Meditation",
        description: "Anapana Meditation For All (Hindi - 10 mins)",
        videoUrl: "https://www.youtube.com/watch?v=mAtSIuTSx90", // Example YouTube URL
        duration: "20:15",
        thumbnail: "", // Will be populated
      },
      {
        id: "med-3",
        title: "Vipassana Meditation",
        description: "Beginner level Vipassana Meditation",
        videoUrl: "https://www.youtube.com/watch?v=iBU3d-MTWsU", // Example YouTube URL
        duration: "1:25:09",
        thumbnail: "", // Will be populated
      },
      {
        id: "med-4",
        title: "Vipassana Meditation",
        description: "Advance level Vipassana Meditation",
        videoUrl: "https://www.youtube.com/watch?v=gGbbSgD5jC0", // Example YouTube URL
        duration: "1:18:35",
        thumbnail: "", // Will be populated
      },
    ],
  },
  {
    id: "nsdr-videos",
    name: "NSDR",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    iconId: "code",
    description: "Rest properly with Non-Sleep Deep Rest",
    videos: [
      {
        id: "nsdr-1",
        title: "10 Minute NSDR",
        description: "Non-Sleep Deep Rest with Dr. Andrew Huberman",
        videoUrl: "https://www.youtube.com/watch?v=AKGrmY8OSHM", // Example YouTube URL
        duration: "10:49",
        thumbnail: "", // Will be populated
      },
      {
        id: "nsdr-2",
        title: "15 minute Yoga Nidra",
        description: "15 minute Yoga Nidra",
        videoUrl: "https://www.youtube.com/watch?v=3bMP0NSwPgw&t=175s", // Example YouTube URL
        isRecommended: true,
        duration: "32:15",
        thumbnail: "", // Will be populated
      },
      {
        id: "nsdr-3",
        title: "20 Minute Yoga Nidra",
        description: "Non-Sleep Deep Rest with Dr. Andrew Huberman",
        videoUrl: "https://www.youtube.com/watch?v=hEypv90GzDE", // Example YouTube URL
        duration: "20:51",
        thumbnail: "", // Will be populated
      },
      {
        id: "nsdr-4",
        title: "30 minute NSDR",
        description: "Non-Sleep Deep Rest",
        videoUrl: "https://www.youtube.com/watch?v=6SdtKmXqkwc", // Example YouTube URL
        duration: "30:00",
        thumbnail: "", // Will be populated
      },
    ],
  },
  {
    id: "study-videos",
    name: "Study With Me",
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    iconId: "book",
    description: "Focus and study with virtual companions",
    videos: [
      {
        id: "study-1",
        title: "2-Hour Pomodoro Study Session",
        description: "Study session with timed breaks",
        videoUrl: "https://www.youtube.com/embed/382OExOIipQ", // Example YouTube URL (Lofi Girl)
        duration: "1:43:08",
        thumbnail: "", // Will be populated
      },
      {
        id: "study-2",
        title: "3-Hour Pomodoro Study Session",
        description: "Study session with timed breaks",
        videoUrl: "https://www.youtube.com/embed/ZMsTMuyH7w8", // Example YouTube URL
        duration: "2:51:43",
        isRecommended: true,
        thumbnail: "", // Will be populated
      },
      {
        id: "study-3",
        title: "2-HOUR STUDY WITH ME",
        description: "Pomodoro timer 2x50 | Deep Focus | Lofi",
        videoUrl: "https://www.youtube.com/watch?v=QebXHPY7sac", // Example YouTube URL
        duration: "2:00:00",
        thumbnail: "", // Will be populated
      },
    ],
  },
]

const getDefaultWebsiteCategories = (): WebsiteCategory[] => [
  {
    id: "productivity-websites",
    name: "Productivity",
    icon: <Lightbulb className="h-6 w-6 text-amber-500" />,
    iconId: "lightbulb",
    description: "Tools to boost your efficiency and get more done",
    websites: [
      {
        id: "prod-web-1",
        title: "Todoist",
        description: "Task management app that helps you stay organized",
        websiteUrl: "https://todoist.com",
        isRecommended: true,
        addedOn: "2023-05-15",
        favicon: "", // Will be populated
      },
      {
        id: "prod-web-2",
        title: "Notion",
        description: "All-in-one workspace for notes, tasks, wikis, and databases",
        websiteUrl: "https://notion.so",
        addedOn: "2023-06-20",
        favicon: "", // Will be populated
      },
      {
        id: "prod-web-3",
        title: "Trello",
        description: "Visual tool for organizing your work and life",
        websiteUrl: "https://trello.com",
        addedOn: "2023-07-10",
        favicon: "", // Will be populated
      },
    ],
  },
  {
    id: "meditation-websites",
    name: "Meditation",
    icon: <Headphones className="h-6 w-6 text-emerald-500" />,
    iconId: "headphones",
    description: "Resources for mindfulness and meditation",
    websites: [
      {
        id: "med-web-1",
        title: "Headspace",
        description: "Meditation and mindfulness app with guided sessions",
        websiteUrl: "https://www.headspace.com",
        isRecommended: true,
        addedOn: "2023-04-10",
        favicon: "", // Will be populated
      },
      {
        id: "med-web-2",
        title: "Calm",
        description: "App for sleep, meditation and relaxation",
        websiteUrl: "https://www.calm.com",
        addedOn: "2023-05-05",
        favicon: "", // Will be populated
      },
      {
        id: "med-web-3",
        title: "Insight Timer",
        description: "Free app with thousands of guided meditations",
        websiteUrl: "https://insighttimer.com",
        addedOn: "2023-06-15",
        favicon: "", // Will be populated
      },
    ],
  },
  {
    id: "learning-websites",
    name: "Learning",
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    iconId: "book",
    description: "Educational resources and platforms",
    websites: [
      {
        id: "learn-web-1",
        title: "Khan Academy",
        description: "Free world-class education for anyone, anywhere",
        websiteUrl: "https://www.khanacademy.org",
        isRecommended: true,
        addedOn: "2023-03-25",
        favicon: "", // Will be populated
      },
      {
        id: "learn-web-2",
        title: "Coursera",
        description: "Online courses from top universities and companies",
        websiteUrl: "https://www.coursera.org",
        addedOn: "2023-04-18",
        favicon: "", // Will be populated
      },
      {
        id: "learn-web-3",
        title: "edX",
        description: "Free online courses from Harvard, MIT, and more",
        websiteUrl: "https://www.edx.org",
        addedOn: "2023-05-22",
        favicon: "", // Will be populated
      },
    ],
  },
  {
    id: "tools-websites",
    name: "Useful Tools",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    iconId: "code",
    description: "Helpful online tools and utilities",
    websites: [
      {
        id: "tools-web-1",
        title: "Canva",
        description: "Graphic design platform for creating visual content",
        websiteUrl: "https://www.canva.com",
        isRecommended: true,
        addedOn: "2023-02-15",
        favicon: "", // Will be populated
      },
      {
        id: "tools-web-2",
        title: "Wolfram Alpha",
        description: "Computational intelligence for knowledge and answers",
        websiteUrl: "https://www.wolframalpha.com",
        addedOn: "2023-03-10",
        favicon: "", // Will be populated
      },
      {
        id: "tools-web-3",
        title: "Grammarly",
        description: "Digital writing assistant for clear, mistake-free writing",
        websiteUrl: "https://www.grammarly.com",
        addedOn: "2023-04-05",
        favicon: "", // Will be populated
      },
    ],
  },
]

// Available icons for categories
const availableIcons = [
  { id: "lightbulb", icon: <Lightbulb className="h-6 w-6 text-amber-500" />, name: "Lightbulb", color: "amber" },
  { id: "headphones", icon: <Headphones className="h-6 w-6 text-emerald-500" />, name: "Headphones", color: "emerald" },
  { id: "code", icon: <Code className="h-6 w-6 text-blue-500" />, name: "Code", color: "blue" },
  { id: "book", icon: <BookOpen className="h-6 w-6 text-purple-500" />, name: "Book", color: "purple" },
  { id: "film", icon: <Film className="h-6 w-6 text-rose-500" />, name: "Film", color: "rose" },
  { id: "globe", icon: <Globe className="h-6 w-6 text-teal-500" />, name: "Globe", color: "teal" },
]

// Slider Component
interface SliderProps {
  children: React.ReactNode[]
  itemsPerView?: number
  className?: string
}

function Slider({ children, itemsPerView = 4, className }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Adjust items per view based on screen size
  const getItemsPerView = () => {
    if (isMobile) return 1
    if (isTablet) return Math.min(2, itemsPerView)
    return itemsPerView
  }

  const actualItemsPerView = getItemsPerView()
  const maxIndex = Math.max(0, children.length - actualItemsPerView)

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  if (children.length <= actualItemsPerView) {
    // If we have fewer items than the view can show, just display them normally
    return <div className={cn("grid gap-4", className)}>{children}</div>
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / actualItemsPerView)}%)`,
            width: `${(children.length / actualItemsPerView) * 100}%`,
          }}
        >
          {children.map((child, index) => (
            <div key={index} className="flex-shrink-0" style={{ width: `${100 / children.length}%` }}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-background shadow-lg"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {currentIndex < maxIndex && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-background shadow-lg"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Dots indicator */}
      {maxIndex > 0 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-primary" : "bg-muted-foreground/30",
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Component ---

export default function ToolsPage() {
  // Resource type state (videos or websites)
  const [resourceType, setResourceType] = useState<"videos" | "websites">("videos")

  // Video states
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([])
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [editingVideoCategoryId, setEditingVideoCategoryId] = useState<string | null>(null)
  const [editVideoFormData, setEditVideoFormData] = useState<Video[]>([])
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false)
  const [isManageVideoCategoriesOpen, setIsManageVideoCategoriesOpen] = useState(false)
  const [newVideoCategoryData, setNewVideoCategoryData] = useState({
    id: "",
    name: "",
    description: "",
    iconId: "lightbulb",
  })
  const [editVideoCategoryData, setEditVideoCategoryData] = useState<{
    id: string
    name: string
    description: string
    iconId: string
  } | null>(null)

  // Website states
  const [websiteCategories, setWebsiteCategories] = useState<WebsiteCategory[]>([])
  const [selectedWebsiteCategory, setSelectedWebsiteCategory] = useState<string | null>(null)
  const [editingWebsiteCategoryId, setEditingWebsiteCategoryId] = useState<string | null>(null)
  const [editWebsiteFormData, setEditWebsiteFormData] = useState<Website[]>([])
  const [isEditWebsiteDialogOpen, setIsEditWebsiteDialogOpen] = useState(false)
  const [isManageWebsiteCategoriesOpen, setIsManageWebsiteCategoriesOpen] = useState(false)
  const [newWebsiteCategoryData, setNewWebsiteCategoryData] = useState({
    id: "",
    name: "",
    description: "",
    iconId: "globe",
  })
  const [editWebsiteCategoryData, setEditWebsiteCategoryData] = useState<{
    id: string
    name: string
    description: string
    iconId: string
  } | null>(null)

  // Shared states
  const { theme } = useTheme()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Process videos to add thumbnail URLs
  const processVideos = (videos: Video[]): Video[] => {
    return videos.map((video) => {
      const videoId = getYoutubeVideoId(video.videoUrl)
      const thumbnailUrl = videoId
        ? getYoutubeThumbnailUrl(videoId, "mqdefault") // Medium quality for grid
        : `/placeholder.svg?height=180&width=320&text=Thumb+Error` // Fallback
      return { ...video, thumbnail: thumbnailUrl }
    })
  }

  // Process websites to add favicon URLs
  const processWebsites = (websites: Website[]): Website[] => {
    return websites.map((website) => {
      const faviconUrl = getFaviconUrl(website.websiteUrl)
      return { ...website, favicon: faviconUrl }
    })
  }

  // Load data from localStorage or use defaults
  useEffect(() => {
    const loadVideoCategories = () => {
      try {
        const savedCategories = localStorage.getItem("videoCategories")
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          // Process each category's videos to add thumbnails
          const processedCategories = parsedCategories.map((category: any) => ({
            ...category,
            videos: processVideos(category.videos || []),
            // Recreate React elements for icons
            icon: getIconById(category.iconId),
          }))
          setVideoCategories(processedCategories)
        } else {
          // Use default data and process it
          const defaultData = getDefaultVideoCategories()
          const processedDefaultData = defaultData.map((category) => ({
            ...category,
            iconId: category.iconId || getIconIdFromCategory(category), // Store the icon ID
            videos: processVideos(category.videos || []),
          }))
          setVideoCategories(processedDefaultData)
        }
      } catch (error) {
        console.error("Error loading video categories:", error)
        // Fallback to defaults if there's an error
        const defaultData = getDefaultVideoCategories()
        const processedDefaultData = defaultData.map((category) => ({
          ...category,
          iconId: category.iconId || getIconIdFromCategory(category), // Store the icon ID
          videos: processVideos(category.videos || []),
        }))
        setVideoCategories(processedDefaultData)
      }
    }

    const loadWebsiteCategories = () => {
      try {
        const savedCategories = localStorage.getItem("websiteCategories")
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          // Process each category's websites to add favicons
          const processedCategories = parsedCategories.map((category: any) => ({
            ...category,
            websites: processWebsites(category.websites || []),
            // Recreate React elements for icons
            icon: getIconById(category.iconId),
          }))
          setWebsiteCategories(processedCategories)
        } else {
          // Use default data and process it
          const defaultData = getDefaultWebsiteCategories()
          const processedDefaultData = defaultData.map((category) => ({
            ...category,
            iconId: category.iconId || getIconIdFromCategory(category), // Store the icon ID
            websites: processWebsites(category.websites || []),
          }))
          setWebsiteCategories(processedDefaultData)
        }
      } catch (error) {
        console.error("Error loading website categories:", error)
        // Fallback to defaults if there's an error
        const defaultData = getDefaultWebsiteCategories()
        const processedDefaultData = defaultData.map((category) => ({
          ...category,
          iconId: category.iconId || getIconIdFromCategory(category), // Store the icon ID
          websites: processWebsites(category.websites || []),
        }))
        setWebsiteCategories(processedDefaultData)
      }
    }

    loadVideoCategories()
    loadWebsiteCategories()
  }, [])

  // Set initial selected categories once categories are loaded
  useEffect(() => {
    if (videoCategories.length > 0 && !selectedVideoCategory) {
      setSelectedVideoCategory(videoCategories[0].id)
    }
    if (websiteCategories.length > 0 && !selectedWebsiteCategory) {
      setSelectedWebsiteCategory(websiteCategories[0].id)
    }
  }, [videoCategories, websiteCategories, selectedVideoCategory, selectedWebsiteCategory])

  // Get icon ID from category (for initial setup)
  const getIconIdFromCategory = (category: VideoCategory | WebsiteCategory): string => {
    if (category.id.includes("productivity")) return "lightbulb"
    if (category.id.includes("meditation")) return "headphones"
    if (category.id.includes("nsdr") || category.id.includes("tools")) return "code"
    if (category.id.includes("study") || category.id.includes("learning")) return "book"
    return category.id.includes("video") ? "film" : "globe" // Default based on type
  }

  // Get icon by ID
  const getIconById = (iconId: string): React.ReactNode => {
    const iconObj = availableIcons.find((icon) => icon.id === iconId)
    return iconObj ? iconObj.icon : availableIcons[0].icon
  }

  // Save video categories to localStorage
  const saveVideoCategoriesToStorage = (categoriesToSave: VideoCategory[]) => {
    try {
      // We need to strip out the thumbnail URLs before saving to localStorage
      // and convert React elements to string IDs
      const categoriesToStore = categoriesToSave.map((category) => ({
        ...category,
        videos: (category.videos || []).map((video) => ({
          ...video,
          thumbnail: "", // Don't store thumbnails
        })),
        // Store icon ID instead of React element
        iconId: category.iconId || getIconIdFromCategory(category),
        icon: undefined, // Don't store React elements
      }))

      localStorage.setItem("videoCategories", JSON.stringify(categoriesToStore))
      toast({
        title: "Saved Successfully",
        description: "Your video category changes have been saved.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving video categories:", error)
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save website categories to localStorage
  const saveWebsiteCategoriesToStorage = (categoriesToSave: WebsiteCategory[]) => {
    try {
      // We need to strip out the favicon URLs before saving to localStorage
      // and convert React elements to string IDs
      const categoriesToStore = categoriesToSave.map((category) => ({
        ...category,
        websites: (category.websites || []).map((website) => ({
          ...website,
          favicon: "", // Don't store favicons
        })),
        // Store icon ID instead of React element
        iconId: category.iconId || getIconIdFromCategory(category),
        icon: undefined, // Don't store React elements
      }))

      localStorage.setItem("websiteCategories", JSON.stringify(categoriesToStore))
      toast({
        title: "Saved Successfully",
        description: "Your website category changes have been saved.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving website categories:", error)
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Reset to default categories
  const resetToDefaults = () => {
    console.log("Resetting to defaults...")

    // Reset video categories
    const defaultVideoData = getDefaultVideoCategories()
    const processedDefaultVideoData = defaultVideoData.map((category) => ({
      ...category,
      iconId: category.iconId || getIconIdFromCategory(category),
      videos: processVideos(category.videos || []),
    }))
    setVideoCategories(processedDefaultVideoData)

    // Reset website categories
    const defaultWebsiteData = getDefaultWebsiteCategories()
    const processedDefaultWebsiteData = defaultWebsiteData.map((category) => ({
      ...category,
      iconId: category.iconId || getIconIdFromCategory(category),
      websites: processWebsites(category.websites || []),
    }))
    setWebsiteCategories(processedDefaultWebsiteData)

    // Clear localStorage
    localStorage.removeItem("videoCategories")
    localStorage.removeItem("websiteCategories")

    // Reset selections
    setSelectedVideoCategory(defaultVideoData[0].id)
    setSelectedWebsiteCategory(defaultWebsiteData[0].id)
    setSelectedVideo(null)

    toast({
      title: "Reset Complete",
      description: "All categories and resources have been reset to defaults.",
      duration: 3000,
    })
  }

  // Handle video category selection
  const handleVideoCategorySelect = (categoryId: string) => {
    setSelectedVideoCategory(categoryId)
    setSelectedVideo(null)
  }

  // Handle website category selection
  const handleWebsiteCategorySelect = (categoryId: string) => {
    setSelectedWebsiteCategory(categoryId)
  }

  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setTimeout(() => {
      const videoPlayer = document.getElementById("resource-player-section")
      if (videoPlayer) {
        videoPlayer.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Handle website selection - open in new tab
  const handleWebsiteSelect = (website: Website) => {
    window.open(website.websiteUrl, "_blank", "noopener,noreferrer")
  }

  // Handle back to resources
  const handleBackToResources = () => {
    setSelectedVideo(null)
  }

  // Open edit dialog for a category's videos
  const openEditVideoDialog = (categoryId: string) => {
    const category = videoCategories.find((cat) => cat.id === categoryId)
    if (category) {
      // Create a deep copy of the videos for editing
      setEditVideoFormData([...(category.videos || [])])
      setEditingVideoCategoryId(categoryId)
      setIsEditVideoDialogOpen(true)
    }
  }

  // Open edit dialog for a category's websites
  const openEditWebsiteDialog = (categoryId: string) => {
    const category = websiteCategories.find((cat) => cat.id === categoryId)
    if (category) {
      // Create a deep copy of the websites for editing
      setEditWebsiteFormData([...(category.websites || [])])
      setEditingWebsiteCategoryId(categoryId)
      setIsEditWebsiteDialogOpen(true)
    }
  }

  // Handle edit form input changes for videos
  const handleEditVideoFormChange = (index: number, field: keyof Video, value: string | boolean) => {
    const updatedFormData = [...editVideoFormData]
    if (field === "isRecommended") {
      updatedFormData[index] = {
        ...updatedFormData[index],
        isRecommended: value as boolean,
      }
    } else {
      updatedFormData[index] = {
        ...updatedFormData[index],
        [field]: value as string,
      }
    }
    setEditVideoFormData(updatedFormData)
  }

  // Handle edit form input changes for websites
  const handleEditWebsiteFormChange = (index: number, field: keyof Website, value: string | boolean) => {
    const updatedFormData = [...editWebsiteFormData]
    if (field === "isRecommended") {
      updatedFormData[index] = {
        ...updatedFormData[index],
        isRecommended: value as boolean,
      }
    } else {
      updatedFormData[index] = {
        ...updatedFormData[index],
        [field]: value as string,
      }
    }
    setEditWebsiteFormData(updatedFormData)
  }

  // Add a new video to the edit form
  const addNewVideo = () => {
    if (!editingVideoCategoryId) return

    const newId = `${editingVideoCategoryId}-${Date.now()}`
    setEditVideoFormData([
      ...editVideoFormData,
      {
        id: newId,
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        thumbnail: "",
      },
    ])
  }

  // Add a new website to the edit form
  const addNewWebsite = () => {
    if (!editingWebsiteCategoryId) return

    const newId = `${editingWebsiteCategoryId}-${Date.now()}`
    setEditWebsiteFormData([
      ...editWebsiteFormData,
      {
        id: newId,
        title: "",
        description: "",
        websiteUrl: "",
        addedOn: new Date().toISOString().split("T")[0],
        favicon: "",
      },
    ])
  }

  // Remove a video from the edit form
  const removeVideo = (index: number) => {
    const updatedFormData = [...editVideoFormData]
    updatedFormData.splice(index, 1)
    setEditVideoFormData(updatedFormData)
  }

  // Remove a website from the edit form
  const removeWebsite = (index: number) => {
    const updatedFormData = [...editWebsiteFormData]
    updatedFormData.splice(index, 1)
    setEditWebsiteFormData(updatedFormData)
  }

  // Save edited videos
  const saveEditedVideos = () => {
    if (!editingVideoCategoryId) return

    // Validate URLs and required fields
    const invalidEntries = editVideoFormData.filter(
      (video) =>
        (video.videoUrl.trim() !== "" && !getYoutubeVideoId(video.videoUrl)) ||
        video.title.trim() === "" ||
        video.duration.trim() === "",
    )

    if (invalidEntries.length > 0) {
      toast({
        title: "Invalid Entries",
        description: "Please ensure all videos have valid YouTube URLs, titles, and durations.",
        variant: "destructive",
      })
      return
    }

    // Filter out empty entries
    const validVideos = editVideoFormData
      .filter((video) => video.videoUrl.trim() !== "")
      .map((video) => ({
        ...video,
        thumbnail: "", // Will be regenerated
      }))

    // Update the categories state
    const updatedCategories = videoCategories.map((category) => {
      if (category.id === editingVideoCategoryId) {
        return {
          ...category,
          videos: processVideos(validVideos),
        }
      }
      return category
    })

    setVideoCategories(updatedCategories)
    saveVideoCategoriesToStorage(updatedCategories)
    setIsEditVideoDialogOpen(false)
    setEditingVideoCategoryId(null)
  }

  // Save edited websites
  const saveEditedWebsites = () => {
    if (!editingWebsiteCategoryId) return

    // Validate URLs and required fields
    const invalidEntries = editWebsiteFormData.filter(
      (website) =>
        website.title.trim() === "" ||
        website.websiteUrl.trim() === "" ||
        !website.websiteUrl.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/),
    )

    if (invalidEntries.length > 0) {
      toast({
        title: "Invalid Entries",
        description: "Please ensure all websites have valid URLs and titles.",
        variant: "destructive",
      })
      return
    }

    // Filter out empty entries
    const validWebsites = editWebsiteFormData
      .filter((website) => website.websiteUrl.trim() !== "")
      .map((website) => ({
        ...website,
        favicon: "", // Will be regenerated
      }))

    // Update the categories state
    const updatedCategories = websiteCategories.map((category) => {
      if (category.id === editingWebsiteCategoryId) {
        return {
          ...category,
          websites: processWebsites(validWebsites),
        }
      }
      return category
    })

    setWebsiteCategories(updatedCategories)
    saveWebsiteCategoriesToStorage(updatedCategories)
    setIsEditWebsiteDialogOpen(false)
    setEditingWebsiteCategoryId(null)
  }

  // Add a new video category
  const addNewVideoCategory = () => {
    // Validate
    if (
      newVideoCategoryData.name.trim() === "" ||
      newVideoCategoryData.description.trim() === "" ||
      newVideoCategoryData.iconId === ""
    ) {
      toast({
        title: "Invalid Category",
        description: "Please provide a name, description, and icon for the new category.",
        variant: "destructive",
      })
      return
    }

    // Generate a unique ID
    const id =
      newVideoCategoryData.name.toLowerCase().replace(/\s+/g, "-") + "-videos-" + Date.now().toString().slice(-4)

    // Create new category
    const newCategory: VideoCategory = {
      id,
      name: newVideoCategoryData.name,
      description: newVideoCategoryData.description,
      icon: getIconById(newVideoCategoryData.iconId),
      iconId: newVideoCategoryData.iconId,
      videos: [],
    }

    // Add to categories
    const updatedCategories = [...videoCategories, newCategory]
    setVideoCategories(updatedCategories)
    saveVideoCategoriesToStorage(updatedCategories)

    // Reset form
    setNewVideoCategoryData({
      id: "",
      name: "",
      description: "",
      iconId: "lightbulb",
    })

    // Select the new category
    setSelectedVideoCategory(id)
    toast({
      title: "Category Added",
      description: `"${newVideoCategoryData.name}" has been added. You can now add videos to it.`,
    })
  }

  // Add a new website category
  const addNewWebsiteCategory = () => {
    // Validate
    if (
      newWebsiteCategoryData.name.trim() === "" ||
      newWebsiteCategoryData.description.trim() === "" ||
      newWebsiteCategoryData.iconId === ""
    ) {
      toast({
        title: "Invalid Category",
        description: "Please provide a name, description, and icon for the new category.",
        variant: "destructive",
      })
      return
    }

    // Generate a unique ID
    const id =
      newWebsiteCategoryData.name.toLowerCase().replace(/\s+/g, "-") + "-websites-" + Date.now().toString().slice(-4)

    // Create new category
    const newCategory: WebsiteCategory = {
      id,
      name: newWebsiteCategoryData.name,
      description: newWebsiteCategoryData.description,
      icon: getIconById(newWebsiteCategoryData.iconId),
      iconId: newWebsiteCategoryData.iconId,
      websites: [],
    }

    // Add to categories
    const updatedCategories = [...websiteCategories, newCategory]
    setWebsiteCategories(updatedCategories)
    saveWebsiteCategoriesToStorage(updatedCategories)

    // Reset form
    setNewWebsiteCategoryData({
      id: "",
      name: "",
      description: "",
      iconId: "globe",
    })

    // Select the new category
    setSelectedWebsiteCategory(id)
    toast({
      title: "Category Added",
      description: `"${newWebsiteCategoryData.name}" has been added. You can now add websites to it.`,
    })
  }

  // Edit an existing video category
  const startEditVideoCategory = (category: VideoCategory) => {
    setEditVideoCategoryData({
      id: category.id,
      name: category.name,
      description: category.description,
      iconId: category.iconId || getIconIdFromCategory(category),
    })
  }

  // Edit an existing website category
  const startEditWebsiteCategory = (category: WebsiteCategory) => {
    setEditWebsiteCategoryData({
      id: category.id,
      name: category.name,
      description: category.description,
      iconId: category.iconId || getIconIdFromCategory(category),
    })
  }

  // Save edited video category
  const saveEditedVideoCategory = () => {
    if (!editVideoCategoryData) return

    // Validate
    if (editVideoCategoryData.name.trim() === "" || editVideoCategoryData.description.trim() === "") {
      toast({
        title: "Invalid Category",
        description: "Please provide a name and description for the category.",
        variant: "destructive",
      })
      return
    }

    // Update category
    const updatedCategories = videoCategories.map((category) => {
      if (category.id === editVideoCategoryData.id) {
        return {
          ...category,
          name: editVideoCategoryData.name,
          description: editVideoCategoryData.description,
          icon: getIconById(editVideoCategoryData.iconId),
          iconId: editVideoCategoryData.iconId,
        }
      }
      return category
    })

    setVideoCategories(updatedCategories)
    saveVideoCategoriesToStorage(updatedCategories)
    setEditVideoCategoryData(null)
    toast({
      title: "Category Updated",
      description: `"${editVideoCategoryData.name}" has been updated.`,
    })
  }

  // Save edited website category
  const saveEditedWebsiteCategory = () => {
    if (!editWebsiteCategoryData) return

    // Validate
    if (editWebsiteCategoryData.name.trim() === "" || editWebsiteCategoryData.description.trim() === "") {
      toast({
        title: "Invalid Category",
        description: "Please provide a name and description for the category.",
        variant: "destructive",
      })
      return
    }

    // Update category
    const updatedCategories = websiteCategories.map((category) => {
      if (category.id === editWebsiteCategoryData.id) {
        return {
          ...category,
          name: editWebsiteCategoryData.name,
          description: editWebsiteCategoryData.description,
          icon: getIconById(editWebsiteCategoryData.iconId),
          iconId: editWebsiteCategoryData.iconId,
        }
      }
      return category
    })

    setWebsiteCategories(updatedCategories)
    saveWebsiteCategoriesToStorage(updatedCategories)
    setEditWebsiteCategoryData(null)
    toast({
      title: "Category Updated",
      description: `"${editWebsiteCategoryData.name}" has been updated.`,
    })
  }

  // Delete a video category
  const deleteVideoCategory = (categoryId: string) => {
    const updatedCategories = videoCategories.filter((category) => category.id !== categoryId)
    setVideoCategories(updatedCategories)
    saveVideoCategoriesToStorage(updatedCategories)

    // If the deleted category was selected, select the first available category
    if (selectedVideoCategory === categoryId) {
      setSelectedVideoCategory(updatedCategories.length > 0 ? updatedCategories[0].id : null)
    }

    toast({
      title: "Category Deleted",
      description: "The video category has been removed.",
    })
  }

  // Delete a website category
  const deleteWebsiteCategory = (categoryId: string) => {
    const updatedCategories = websiteCategories.filter((category) => category.id !== categoryId)
    setWebsiteCategories(updatedCategories)
    saveWebsiteCategoriesToStorage(updatedCategories)

    // If the deleted category was selected, select the first available category
    if (selectedWebsiteCategory === categoryId) {
      setSelectedWebsiteCategory(updatedCategories.length > 0 ? updatedCategories[0].id : null)
    }

    toast({
      title: "Category Deleted",
      description: "The website category has been removed.",
    })
  }

  // Get the selected category data
  const selectedVideoCategoryData = videoCategories.find((cat) => cat.id === selectedVideoCategory)
  const selectedWebsiteCategoryData = websiteCategories.find((cat) => cat.id === selectedWebsiteCategory)

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <PageHeader
        title="Resource Library"
        icon={<Library className="h-6 w-6" />}
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset everything. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <Tabs
        defaultValue="videos"
        onValueChange={(value) => setResourceType(value as "videos" | "websites")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="videos" className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Websites
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Videos Tab Content */}
        <TabsContent value="videos" className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Video Categories</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsManageVideoCategoriesOpen(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage Categories
              </Button>
            </div>

            <Slider itemsPerView={isMobile ? 2 : 4} className="grid-cols-2 md:grid-cols-4">
              {videoCategories.map((category) => (
                <Card
                  key={category.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:border-primary",
                    selectedVideoCategory === category.id ? "border-primary bg-primary/5" : "",
                  )}
                  onClick={() => handleVideoCategorySelect(category.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-muted">{category.icon}</div>
                    <h3 className="font-medium">{category.name}</h3>
                    {!isMobile && <p className="text-xs text-muted-foreground">{category.description}</p>}
                  </div>
                </Card>
              ))}
            </Slider>
          </div>

          {selectedVideoCategoryData && !selectedVideo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedVideoCategoryData.name} Videos</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedVideoCategoryData.videos?.length || 0} video
                    {selectedVideoCategoryData.videos?.length !== 1 ? "s" : ""} available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditVideoDialog(selectedVideoCategoryData.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Videos
                  </Button>
                </div>
              </div>
              {selectedVideoCategoryData.videos?.length > 0 ? (
                <Slider itemsPerView={isMobile ? 1 : 4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {selectedVideoCategoryData.videos.map((video) => (
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.onerror = null
                            target.src = `/placeholder.svg?height=180&width=320&text=Load+Error`
                          }}
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
                </Slider>
              ) : (
                <div className="flex items-center justify-center h-[300px] bg-card border rounded-xl">
                  <div className="text-center max-w-md p-6">
                    <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      This category doesn't have any videos yet. Add some to get started.
                    </p>
                    <Button onClick={() => openEditVideoDialog(selectedVideoCategoryData.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Videos
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedVideo && (
            <div id="resource-player-section" className="space-y-4">
              <Button variant="ghost" className="flex items-center gap-2 mb-2 pl-2" onClick={handleBackToResources}>
                <ArrowLeft className="h-4 w-4" />
                Back to videos
              </Button>
              <div className="bg-card border rounded-xl overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                      {selectedVideo.isRecommended && (
                        <Badge className="bg-primary hover:bg-primary">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedVideoCategoryData?.name}</Badge>
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

          {videoCategories.length > 0 && !selectedVideoCategoryData && !selectedVideo && (
            <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
              <div className="text-center max-w-md p-6">
                <Film className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Select a video category</h2>
                <p className="text-muted-foreground">
                  Choose from our curated collection of videos to enhance your productivity, learning, and wellbeing
                </p>
              </div>
            </div>
          )}

          {videoCategories.length === 0 && (
            <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
              <div className="text-center max-w-md p-6">
                <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Video Categories Available</h2>
                <p className="text-muted-foreground mb-4">
                  It looks like there are no video categories to display at the moment.
                </p>
                <Button onClick={() => setIsManageVideoCategoriesOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video Category
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Websites Tab Content */}
        <TabsContent value="websites" className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Website Categories</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsManageWebsiteCategoriesOpen(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage Categories
              </Button>
            </div>

            <Slider itemsPerView={isMobile ? 2 : 4} className="grid-cols-2 md:grid-cols-4">
              {websiteCategories.map((category) => (
                <Card
                  key={category.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:border-primary",
                    selectedWebsiteCategory === category.id ? "border-primary bg-primary/5" : "",
                  )}
                  onClick={() => handleWebsiteCategorySelect(category.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-muted">{category.icon}</div>
                    <h3 className="font-medium">{category.name}</h3>
                    {!isMobile && <p className="text-xs text-muted-foreground">{category.description}</p>}
                  </div>
                </Card>
              ))}
            </Slider>
          </div>

          {selectedWebsiteCategoryData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedWebsiteCategoryData.name} Websites</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedWebsiteCategoryData.websites?.length || 0} website
                    {selectedWebsiteCategoryData.websites?.length !== 1 ? "s" : ""} available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditWebsiteDialog(selectedWebsiteCategoryData.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Websites
                  </Button>
                </div>
              </div>
              {selectedWebsiteCategoryData.websites?.length > 0 ? (
                <Slider itemsPerView={isMobile ? 1 : 4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {selectedWebsiteCategoryData.websites.map((website) => (
                    <Card
                      key={website.id}
                      className="overflow-hidden cursor-pointer hover:border-primary transition-all duration-200 group"
                      onClick={() => handleWebsiteSelect(website)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={website.favicon || "/placeholder.svg"}
                            alt=""
                            className="w-8 h-8 rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.onerror = null
                              target.src = `/placeholder.svg?height=32&width=32&text=Icon`
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold line-clamp-1">{website.title}</h3>
                              <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs text-muted-foreground">{getDomainFromUrl(website.websiteUrl)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{website.description}</p>
                        {website.isRecommended && <Badge className="bg-primary hover:bg-primary">Recommended</Badge>}
                      </div>
                    </Card>
                  ))}
                </Slider>
              ) : (
                <div className="flex items-center justify-center h-[300px] bg-card border rounded-xl">
                  <div className="text-center max-w-md p-6">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Websites Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      This category doesn't have any websites yet. Add some to get started.
                    </p>
                    <Button onClick={() => openEditWebsiteDialog(selectedWebsiteCategoryData.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Websites
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {websiteCategories.length > 0 && !selectedWebsiteCategoryData && (
            <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
              <div className="text-center max-w-md p-6">
                <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Select a website category</h2>
                <p className="text-muted-foreground">
                  Choose from our curated collection of websites to enhance your productivity, learning, and wellbeing
                </p>
              </div>
            </div>
          )}

          {websiteCategories.length === 0 && (
            <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
              <div className="text-center max-w-md p-6">
                <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Website Categories Available</h2>
                <p className="text-muted-foreground mb-4">
                  It looks like there are no website categories to display at the moment.
                </p>
                <Button onClick={() => setIsManageWebsiteCategoriesOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Website Category
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Videos Dialog */}
      <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedVideoCategoryData?.name} Videos</DialogTitle>
            <DialogDescription>
              Modify the YouTube video links for this category. You can add as many videos as you want.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
            <div className="space-y-6 py-4">
              {editVideoFormData.map((video, index) => (
                <div key={index} className="space-y-3 pb-4 border-b relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Video {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`recommended-${index}`}
                          checked={video.isRecommended || false}
                          onCheckedChange={(checked) =>
                            handleEditVideoFormChange(index, "isRecommended", checked === true)
                          }
                        />
                        <Label htmlFor={`recommended-${index}`}>Recommended</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeVideo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`title-${index}`}>Title</Label>
                      <Input
                        id={`title-${index}`}
                        value={video.title}
                        onChange={(e) => handleEditVideoFormChange(index, "title", e.target.value)}
                        placeholder="Video title"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={video.description}
                        onChange={(e) => handleEditVideoFormChange(index, "description", e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`url-${index}`}>YouTube URL</Label>
                      <Input
                        id={`url-${index}`}
                        value={video.videoUrl}
                        onChange={(e) => handleEditVideoFormChange(index, "videoUrl", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`duration-${index}`}>Duration</Label>
                      <Input
                        id={`duration-${index}`}
                        value={video.duration}
                        onChange={(e) => handleEditVideoFormChange(index, "duration", e.target.value)}
                        placeholder="e.g. 10:30"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={addNewVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Video
              </Button>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditVideoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedVideos} className="gap-1">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Websites Dialog */}
      <Dialog open={isEditWebsiteDialogOpen} onOpenChange={setIsEditWebsiteDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedWebsiteCategoryData?.name} Websites</DialogTitle>
            <DialogDescription>
              Modify the website links for this category. You can add as many websites as you want.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
            <div className="space-y-6 py-4">
              {editWebsiteFormData.map((website, index) => (
                <div key={index} className="space-y-3 pb-4 border-b relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Website {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`web-recommended-${index}`}
                          checked={website.isRecommended || false}
                          onCheckedChange={(checked) =>
                            handleEditWebsiteFormChange(index, "isRecommended", checked === true)
                          }
                        />
                        <Label htmlFor={`web-recommended-${index}`}>Recommended</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeWebsite(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`web-title-${index}`}>Title</Label>
                      <Input
                        id={`web-title-${index}`}
                        value={website.title}
                        onChange={(e) => handleEditWebsiteFormChange(index, "title", e.target.value)}
                        placeholder="Website title"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`web-description-${index}`}>Description</Label>
                      <Input
                        id={`web-description-${index}`}
                        value={website.description}
                        onChange={(e) => handleEditWebsiteFormChange(index, "description", e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`web-url-${index}`}>Website URL</Label>
                      <Input
                        id={`web-url-${index}`}
                        value={website.websiteUrl}
                        onChange={(e) => handleEditWebsiteFormChange(index, "websiteUrl", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={addNewWebsite}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Website
              </Button>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditWebsiteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedWebsites} className="gap-1">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Video Categories Dialog */}
      <Dialog open={isManageVideoCategoriesOpen} onOpenChange={setIsManageVideoCategoriesOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Video Categories</DialogTitle>
            <DialogDescription>Add, edit, or remove video categories.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Categories</TabsTrigger>
              <TabsTrigger value="new">Add New Category</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="pt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {videoCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">{category.icon}</div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditVideoCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the "{category.name}" category and all its videos. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteVideoCategory(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="new" className="pt-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="video-category-name">Category Name</Label>
                  <Input
                    id="video-category-name"
                    value={newVideoCategoryData.name}
                    onChange={(e) => setNewVideoCategoryData({ ...newVideoCategoryData, name: e.target.value })}
                    placeholder="e.g. Cooking Tutorials"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="video-category-description">Description</Label>
                  <Input
                    id="video-category-description"
                    value={newVideoCategoryData.description}
                    onChange={(e) => setNewVideoCategoryData({ ...newVideoCategoryData, description: e.target.value })}
                    placeholder="e.g. Learn to cook delicious meals"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map((iconOption) => (
                      <div
                        key={iconOption.id}
                        className={cn(
                          "flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50",
                          newVideoCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                        )}
                        onClick={() => setNewVideoCategoryData({ ...newVideoCategoryData, iconId: iconOption.id })}
                      >
                        <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                        <span className="text-xs mt-1">{iconOption.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={addNewVideoCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </TabsContent>
          </Tabs>

          {/* Edit Video Category Form */}
          {editVideoCategoryData && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Video Category</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditVideoCategoryData(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-video-category-name">Category Name</Label>
                    <Input
                      id="edit-video-category-name"
                      value={editVideoCategoryData.name}
                      onChange={(e) => setEditVideoCategoryData({ ...editVideoCategoryData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-video-category-description">Description</Label>
                    <Input
                      id="edit-video-category-description"
                      value={editVideoCategoryData.description}
                      onChange={(e) =>
                        setEditVideoCategoryData({ ...editVideoCategoryData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {availableIcons.map((iconOption) => (
                        <div
                          key={iconOption.id}
                          className={cn(
                            "flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50",
                            editVideoCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                          )}
                          onClick={() => setEditVideoCategoryData({ ...editVideoCategoryData, iconId: iconOption.id })}
                        >
                          <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                          <span className="text-xs mt-1">{iconOption.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditVideoCategoryData(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditedVideoCategory}>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Website Categories Dialog */}
      <Dialog open={isManageWebsiteCategoriesOpen} onOpenChange={setIsManageWebsiteCategoriesOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Website Categories</DialogTitle>
            <DialogDescription>Add, edit, or remove website categories.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Categories</TabsTrigger>
              <TabsTrigger value="new">Add New Category</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="pt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {websiteCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">{category.icon}</div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditWebsiteCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the "{category.name}" category and all its websites. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWebsiteCategory(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="new" className="pt-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="website-category-name">Category Name</Label>
                  <Input
                    id="website-category-name"
                    value={newWebsiteCategoryData.name}
                    onChange={(e) => setNewWebsiteCategoryData({ ...newWebsiteCategoryData, name: e.target.value })}
                    placeholder="e.g. Educational Resources"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="website-category-description">Description</Label>
                  <Input
                    id="website-category-description"
                    value={newWebsiteCategoryData.description}
                    onChange={(e) =>
                      setNewWebsiteCategoryData({ ...newWebsiteCategoryData, description: e.target.value })
                    }
                    placeholder="e.g. Websites for learning and education"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map((iconOption) => (
                      <div
                        key={iconOption.id}
                        className={cn(
                          "flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50",
                          newWebsiteCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                        )}
                        onClick={() => setNewWebsiteCategoryData({ ...newWebsiteCategoryData, iconId: iconOption.id })}
                      >
                        <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                        <span className="text-xs mt-1">{iconOption.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={addNewWebsiteCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </TabsContent>
          </Tabs>

          {/* Edit Website Category Form */}
          {editWebsiteCategoryData && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Website Category</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditWebsiteCategoryData(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-website-category-name">Category Name</Label>
                    <Input
                      id="edit-website-category-name"
                      value={editWebsiteCategoryData.name}
                      onChange={(e) => setEditWebsiteCategoryData({ ...editWebsiteCategoryData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-website-category-description">Description</Label>
                    <Input
                      id="edit-website-category-description"
                      value={editWebsiteCategoryData.description}
                      onChange={(e) =>
                        setEditWebsiteCategoryData({ ...editWebsiteCategoryData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {availableIcons.map((iconOption) => (
                        <div
                          key={iconOption.id}
                          className={cn(
                            "flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50",
                            editWebsiteCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                          )}
                          onClick={() =>
                            setEditWebsiteCategoryData({ ...editWebsiteCategoryData, iconId: iconOption.id })
                          }
                        >
                          <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                          <span className="text-xs mt-1">{iconOption.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditWebsiteCategoryData(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditedWebsiteCategory}>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
