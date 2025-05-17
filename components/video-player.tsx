"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [embedUrl, setEmbedUrl] = useState("")

  useEffect(() => {
    // Convert YouTube URLs to embed format if needed
    if (videoUrl.includes("youtube.com/watch?v=")) {
      const videoId = new URL(videoUrl).searchParams.get("v")
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}`)
    } else if (videoUrl.includes("youtu.be/")) {
      const videoId = videoUrl.split("youtu.be/")[1].split("?")[0]
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}`)
    } else {
      setEmbedUrl(videoUrl)
    }
  }, [videoUrl])

  return (
    <div className="relative aspect-video w-full bg-black/20 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      )}

      <iframe
        src={`${embedUrl}?autoplay=0&rel=0`}
        title="Video player"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
