"use client"

import { useState, useEffect } from "react"

export function useResponsiveCards() {
  const [visibleCards, setVisibleCards] = useState(4)

  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth
      if (width >= 1840) {
        setVisibleCards(4)
      } else if (width >= 1280) {
        setVisibleCards(3)
      } else {
        setVisibleCards(2)
      }
    }

    // Set initial value
    updateVisibleCards()

    // Update on resize
    window.addEventListener("resize", updateVisibleCards)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateVisibleCards)
    }
  }, [])

  return visibleCards
}
