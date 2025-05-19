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
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/components/video-player" // Assuming this component is correctly set up
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import CurrentTimeDisplay from "@/components/current-time-display" // Assuming this component is correctly set up
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

interface VideoCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  videos: Video[] // Videos will have their thumbnails processed
}

// --- Default Data ---
const getDefaultCategories = (): VideoCategory[] => [
  {
    id: "productivity",
    name: "Productivity",
    icon: <Lightbulb className="h-6 w-6 text-amber-500" />,
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
    id: "meditation",
    name: "Meditation",
    icon: <Headphones className="h-6 w-6 text-emerald-500" />,
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
    id: "NSDR",
    name: "NSDR",
    icon: <Code className="h-6 w-6 text-blue-500" />,
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
    id: "study",
    name: "Study With Me",
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
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
]

// --- Component ---

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Video[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({
    id: "",
    name: "",
    description: "",
    iconId: "lightbulb",
  })
  const [editCategoryData, setEditCategoryData] = useState<{
    id: string
    name: string
    description: string
    iconId: string
  } | null>(null)
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

  // Load data from localStorage or use defaults
  useEffect(() => {
    const loadCategories = () => {
      try {
        const savedCategories = localStorage.getItem("videoCategories")
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          // Process each category's videos to add thumbnails
          const processedCategories = parsedCategories.map((category: any) => ({
            ...category,
            videos: processVideos(category.videos),
            // Recreate React elements for icons
            icon: getIconById(category.iconId),
          }))
          setCategories(processedCategories)
        } else {
          // Use default data and process it
          const defaultData = getDefaultCategories()
          const processedDefaultData = defaultData.map((category) => ({
            ...category,
            iconId: getIconIdFromCategory(category), // Store the icon ID
            videos: processVideos(category.videos),
          }))
          setCategories(processedDefaultData)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
        // Fallback to defaults if there's an error
        const defaultData = getDefaultCategories()
        const processedDefaultData = defaultData.map((category) => ({
          ...category,
          iconId: getIconIdFromCategory(category), // Store the icon ID
          videos: processVideos(category.videos),
        }))
        setCategories(processedDefaultData)
      }
    }

    loadCategories()
  }, [])

  // Set initial selected category once categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  // Get icon ID from category (for initial setup)
  const getIconIdFromCategory = (category: VideoCategory): string => {
    if (category.id === "productivity") return "lightbulb"
    if (category.id === "meditation") return "headphones"
    if (category.id === "development") return "code"
    if (category.id === "study") return "book"
    return "film" // Default
  }

  // Get icon by ID
  const getIconById = (iconId: string): React.ReactNode => {
    const iconObj = availableIcons.find((icon) => icon.id === iconId)
    return iconObj ? iconObj.icon : availableIcons[0].icon
  }

  // Save categories to localStorage
  const saveCategoriesToStorage = (categoriesToSave: VideoCategory[]) => {
    try {
      // We need to strip out the thumbnail URLs before saving to localStorage
      // and convert React elements to string IDs
      const categoriesToStore = categoriesToSave.map((category) => ({
        ...category,
        videos: category.videos.map((video) => ({
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
        description: "Your changes have been saved.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving categories:", error)
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
    const defaultData = getDefaultCategories()
    const processedDefaultData = defaultData.map((category) => ({
      ...category,
      iconId: getIconIdFromCategory(category), // Store the icon ID
      videos: processVideos(category.videos),
    }))
    setCategories(processedDefaultData)
    localStorage.removeItem("videoCategories")
    toast({
      title: "Reset Complete",
      description: "All categories and video links have been reset to defaults.",
      duration: 3000,
    })
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedVideo(null)
  }

  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setTimeout(() => {
      const videoPlayer = document.getElementById("video-player-section")
      if (videoPlayer) {
        videoPlayer.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Handle back to videos
  const handleBackToVideos = () => {
    setSelectedVideo(null)
  }

  // Open edit dialog for a category's videos
  const openEditDialog = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (category) {
      // Create a deep copy of the videos for editing
      setEditFormData([...category.videos])
      setEditingCategoryId(categoryId)
      setIsEditDialogOpen(true)
    }
  }

  // Handle edit form input changes for videos
  const handleEditFormChange = (index: number, field: keyof Video, value: string | boolean) => {
    const updatedFormData = [...editFormData]
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
    setEditFormData(updatedFormData)
  }

  // Add a new video to the edit form
  const addNewVideo = () => {
    if (!editingCategoryId) return

    const newId = `${editingCategoryId}-${Date.now()}`
    setEditFormData([
      ...editFormData,
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

  // Remove a video from the edit form
  const removeVideo = (index: number) => {
    const updatedFormData = [...editFormData]
    updatedFormData.splice(index, 1)
    setEditFormData(updatedFormData)
  }

  // Save edited videos
  const saveEditedVideos = () => {
    if (!editingCategoryId) return

    // Validate URLs and required fields
    const invalidEntries = editFormData.filter(
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
    const validVideos = editFormData
      .filter((video) => video.videoUrl.trim() !== "")
      .map((video) => ({
        ...video,
        thumbnail: "", // Will be regenerated
      }))

    // Update the categories state
    const updatedCategories = categories.map((category) => {
      if (category.id === editingCategoryId) {
        return {
          ...category,
          videos: processVideos(validVideos),
        }
      }
      return category
    })

    setCategories(updatedCategories)
    saveCategoriesToStorage(updatedCategories)
    setIsEditDialogOpen(false)
    setEditingCategoryId(null)
  }

  // Add a new category
  const addNewCategory = () => {
    // Validate
    if (
      newCategoryData.name.trim() === "" ||
      newCategoryData.description.trim() === "" ||
      newCategoryData.iconId === ""
    ) {
      toast({
        title: "Invalid Category",
        description: "Please provide a name, description, and icon for the new category.",
        variant: "destructive",
      })
      return
    }

    // Generate a unique ID
    const id = newCategoryData.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4)

    // Create new category
    const newCategory: VideoCategory = {
      id,
      name: newCategoryData.name,
      description: newCategoryData.description,
      icon: getIconById(newCategoryData.iconId),
      iconId: newCategoryData.iconId,
      videos: [],
    }

    // Add to categories
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    saveCategoriesToStorage(updatedCategories)

    // Reset form
    setNewCategoryData({
      id: "",
      name: "",
      description: "",
      iconId: "lightbulb",
    })

    // Select the new category
    setSelectedCategory(id)
    toast({
      title: "Category Added",
      description: `"${newCategoryData.name}" has been added. You can now add videos to it.`,
    })
  }

  // Edit an existing category
  const startEditCategory = (category: VideoCategory) => {
    setEditCategoryData({
      id: category.id,
      name: category.name,
      description: category.description,
      iconId: category.iconId || getIconIdFromCategory(category),
    })
  }

  // Save edited category
  const saveEditedCategory = () => {
    if (!editCategoryData) return

    // Validate
    if (editCategoryData.name.trim() === "" || editCategoryData.description.trim() === "") {
      toast({
        title: "Invalid Category",
        description: "Please provide a name and description for the category.",
        variant: "destructive",
      })
      return
    }

    // Update category
    const updatedCategories = categories.map((category) => {
      if (category.id === editCategoryData.id) {
        return {
          ...category,
          name: editCategoryData.name,
          description: editCategoryData.description,
          icon: getIconById(editCategoryData.iconId),
          iconId: editCategoryData.iconId,
        }
      }
      return category
    })

    setCategories(updatedCategories)
    saveCategoriesToStorage(updatedCategories)
    setEditCategoryData(null)
    toast({
      title: "Category Updated",
      description: `"${editCategoryData.name}" has been updated.`,
    })
  }

  // Delete a category
  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((category) => category.id !== categoryId)
    setCategories(updatedCategories)
    saveCategoriesToStorage(updatedCategories)

    // If the deleted category was selected, select the first available category
    if (selectedCategory === categoryId) {
      setSelectedCategory(updatedCategories.length > 0 ? updatedCategories[0].id : null)
    }

    toast({
      title: "Category Deleted",
      description: "The category has been removed.",
    })
  }

  // Get the selected category data
  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Video Resources</h1>
        <div className="flex items-center gap-2">
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
        <CurrentTimeDisplay />

        </div>
      </header>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsManageCategoriesOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
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

      {selectedCategoryData && !selectedVideo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{selectedCategoryData.name} Videos</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {selectedCategoryData.videos.length} video{selectedCategoryData.videos.length !== 1 ? "s" : ""}{" "}
                available
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(selectedCategoryData.id)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit Videos
              </Button>
            </div>
          </div>
          {selectedCategoryData.videos.length > 0 ? (
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-card border rounded-xl">
              <div className="text-center max-w-md p-6">
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This category doesn't have any videos yet. Add some to get started.
                </p>
                <Button onClick={() => openEditDialog(selectedCategoryData.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Videos
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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

      {categories.length > 0 && !selectedCategoryData && !selectedVideo && (
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

      {categories.length === 0 && (
        <div className="flex items-center justify-center h-[400px] bg-card border rounded-xl">
          <div className="text-center max-w-md p-6">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Video Categories Available</h2>
            <p className="text-muted-foreground mb-4">
              It looks like there are no video categories to display at the moment.
            </p>
            <Button onClick={() => setIsManageCategoriesOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      )}

      {/* Edit Videos Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedCategoryData?.name} Videos</DialogTitle>
            <DialogDescription>
              Modify the YouTube video links for this category. You can add as many videos as you want.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
            <div className="space-y-6 py-4">
              {editFormData.map((video, index) => (
                <div key={index} className="space-y-3 pb-4 border-b relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Video {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`recommended-${index}`}
                          checked={video.isRecommended || false}
                          onCheckedChange={(checked) => handleEditFormChange(index, "isRecommended", checked === true)}
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
                        onChange={(e) => handleEditFormChange(index, "title", e.target.value)}
                        placeholder="Video title"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={video.description}
                        onChange={(e) => handleEditFormChange(index, "description", e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`url-${index}`}>YouTube URL</Label>
                      <Input
                        id={`url-${index}`}
                        value={video.videoUrl}
                        onChange={(e) => handleEditFormChange(index, "videoUrl", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`duration-${index}`}>Duration</Label>
                      <Input
                        id={`duration-${index}`}
                        value={video.duration}
                        onChange={(e) => handleEditFormChange(index, "duration", e.target.value)}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedVideos} className="gap-1">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
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
                  {categories.map((category) => (
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
                          onClick={() => startEditCategory(category)}
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
                                onClick={() => deleteCategory(category.id)}
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
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                    placeholder="e.g. Cooking Tutorials"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="category-description">Description</Label>
                  <Input
                    id="category-description"
                    value={newCategoryData.description}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
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
                          newCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                        )}
                        onClick={() => setNewCategoryData({ ...newCategoryData, iconId: iconOption.id })}
                      >
                        <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                        <span className="text-xs mt-1">{iconOption.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={addNewCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </TabsContent>
          </Tabs>

          {/* Edit Category Form */}
          {editCategoryData && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Category</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditCategoryData(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-category-name">Category Name</Label>
                    <Input
                      id="edit-category-name"
                      value={editCategoryData.name}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-category-description">Description</Label>
                    <Input
                      id="edit-category-description"
                      value={editCategoryData.description}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
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
                            editCategoryData.iconId === iconOption.id ? "border-primary bg-primary/5" : "",
                          )}
                          onClick={() => setEditCategoryData({ ...editCategoryData, iconId: iconOption.id })}
                        >
                          <div className="p-2 rounded-full bg-muted">{iconOption.icon}</div>
                          <span className="text-xs mt-1">{iconOption.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditCategoryData(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditedCategory}>Save Changes</Button>
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
