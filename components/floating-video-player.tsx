"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useVideo } from "@/contexts/video-context"
import { X, Minimize, Maximize, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function FloatingVideoPlayer() {
  const { currentVideo, isPlaying, stopVideo, togglePlayPause } = useVideo()
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && playerRef.current) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Ensure the player stays within the viewport
        const maxX = window.innerWidth - playerRef.current.offsetWidth
        const maxY = window.innerHeight - playerRef.current.offsetHeight

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && e.target === e.currentTarget) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  // Update iframe src when isPlaying changes
  useEffect(() => {
    if (iframeRef.current && currentVideo) {
      const url = new URL(currentVideo.videoUrl)

      // For YouTube videos
      if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
        const videoId = url.pathname.includes("embed")
          ? url.pathname.split("/").pop()
          : new URLSearchParams(url.search).get("v")

        if (videoId) {
          const params = new URLSearchParams({
            autoplay: isPlaying ? "1" : "0",
            mute: "0",
            controls: "1",
            rel: "0",
          })

          iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`
        }
      } else {
        // For other video platforms, just set the src directly
        iframeRef.current.src = currentVideo.videoUrl
      }
    }
  }, [currentVideo, isPlaying])

  if (!currentVideo) return null

  return (
    <Card
      ref={playerRef}
      className={cn(
        "fixed z-50 shadow-lg transition-all duration-300 overflow-hidden",
        minimized ? "w-72 h-16" : "w-80 h-64",
      )}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="bg-card p-2 flex items-center justify-between cursor-move" onMouseDown={handleMouseDown}>
        <div className="text-sm font-medium truncate max-w-[180px]">{currentVideo.title}</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMinimized(!minimized)}>
            {minimized ? <Maximize className="h-3 w-3" /> : <Minimize className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={stopVideo}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {minimized ? (
        <div className="flex items-center justify-center h-8 w-full">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </Card>
  )
}
