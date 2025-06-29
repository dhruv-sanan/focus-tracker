"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  isRecommended?: boolean
  duration: string
}

export interface Website {
  id: string
  title: string
  description: string
  websiteUrl: string
  favicon: string
  isRecommended?: boolean
  addedOn: string
}

export interface VideoCategory {
  id: string
  name: string
  icon: React.ReactNode
  iconId: string
  description: string
  videos: Video[]
}

export interface WebsiteCategory {
  id: string
  name: string
  icon: React.ReactNode
  iconId: string
  description: string
  websites: Website[]
}

// Helper functions
function getYoutubeVideoId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function getYoutubeThumbnailUrl(
  videoId: string,
  quality: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault" = "mqdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
  } catch (error) {
    return "/placeholder.svg?height=32&width=32&text=Icon"
  }
}

function processVideos(videos: Video[]): Video[] {
  return videos.map((video) => {
    const videoId = getYoutubeVideoId(video.videoUrl)
    const thumbnailUrl = videoId
      ? getYoutubeThumbnailUrl(videoId, "mqdefault")
      : `/placeholder.svg?height=180&width=320&text=Thumb+Error`
    return { ...video, thumbnail: thumbnailUrl }
  })
}

function processWebsites(websites: Website[]): Website[] {
  return websites.map((website) => {
    const faviconUrl = getFaviconUrl(website.websiteUrl)
    return { ...website, favicon: faviconUrl }
  })
}

export function useCategories() {
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([])
  const [websiteCategories, setWebsiteCategories] = useState<WebsiteCategory[]>([])

  const saveVideoCategoriesToStorage = (categoriesToSave: VideoCategory[]) => {
    try {
      const categoriesToStore = categoriesToSave.map((category) => ({
        ...category,
        videos: (category.videos || []).map((video) => ({
          ...video,
          thumbnail: "",
        })),
        iconId: category.iconId,
        icon: undefined,
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

  const saveWebsiteCategoriesToStorage = (categoriesToSave: WebsiteCategory[]) => {
    try {
      const categoriesToStore = categoriesToSave.map((category) => ({
        ...category,
        websites: (category.websites || []).map((website) => ({
          ...website,
          favicon: "",
        })),
        iconId: category.iconId,
        icon: undefined,
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

  return {
    videoCategories,
    websiteCategories,
    setVideoCategories,
    setWebsiteCategories,
    saveVideoCategoriesToStorage,
    saveWebsiteCategoriesToStorage,
    processVideos,
    processWebsites,
  }
}
