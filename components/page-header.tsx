"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import CurrentTimeDisplay from "./current-time-display"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode
  backButton?: ReactNode
  className?: string
  showBorder?: boolean
}

export function PageHeader({ title, icon, actions, backButton, className, showBorder = false }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center justify-between py-4 md:py-6", showBorder && "border-b", className)}
    >
      <div className="flex items-center gap-3">
        {backButton}
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <CurrentTimeDisplay />
      </div>
    </motion.header>
  )
}
