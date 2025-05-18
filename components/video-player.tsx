"use client"

import { useEffect, useRef } from "react"

interface VideoPlayerProps {
  videoUrl: string
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Handle different YouTube URL formats
    let embedUrl = videoUrl

    // Convert watch URLs to embed URLs
    if (videoUrl.includes("youtube.com/watch")) {
      const videoId = new URL(videoUrl).searchParams.get("v")
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }
    // Convert youtu.be URLs to embed URLs
    else if (videoUrl.includes("youtu.be/")) {
      const videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0]
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Update iframe src if needed
    if (iframeRef.current && iframeRef.current.src !== embedUrl) {
      iframeRef.current.src = embedUrl
    }
  }, [videoUrl])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full aspect-video"
      src={videoUrl}
      title="Video Player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}
