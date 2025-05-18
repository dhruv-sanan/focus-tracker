"use client"

import { useState, useEffect, useRef } from "react"

interface VideoPlayerProps {
  videoUrl: string
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsLoading(true)

    const handleIframeLoad = () => {
      setIsLoading(false)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad)
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad)
      }
    }
  }, [videoUrl])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full h-full aspect-video"
        title="Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
