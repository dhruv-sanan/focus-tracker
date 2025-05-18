"use client"

import Link from "next/link"
import { BarChart3, Home, Settings, Book, Clock, PenToolIcon as Tool, ChevronRight, User, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import type * as React from "react"
import { useState, useEffect } from 'react';

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  gradient: string
  iconColor: string
  onClick?: () => void
  hoverColor: string
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

// Variants for the custom animated tooltip
const customTooltipVariants = {
  initial: { opacity: 0, x: -15, pointerEvents: "none" as const, transition: { duration: 0.2 } },
  hover: { opacity: 2, x: 0, pointerEvents: "auto" as const, transition: { duration: 0.2, delay: 0.2 } }, // Delay to prevent flashing
};


export default function Sidebar() {
  const [showTimer, setShowTimer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isDarkTheme = resolvedTheme === "dark";

  if (!hasMounted) return null;

  const menuItems: MenuItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
      hoverColor: "group-hover:text-blue-500",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Pomodoro",
      href: "/pomodoro",
      gradient: "radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(245, 158, 11, 0.06) 50%, rgba(217, 119, 6, 0) 100%)",
      iconColor: "text-yellow-500",
        hoverColor: "group-hover:text-orange-500",
    },
    {
      icon: <Book className="h-5 w-5" />,
      label: "Journal",
      href: "/journal",
      gradient: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.06) 50%, rgba(103, 23, 205, 0) 100%)",
      iconColor: "text-purple-500",
        hoverColor: "group-hover:text-purple-500",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      href: "/analytics",
      gradient: "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.06) 50%, rgba(21, 128, 61, 0) 100%)",
      iconColor: "text-green-500",
        hoverColor: "group-hover:text-green-500",
    },
    {
      icon: <Tool className="h-5 w-5" />,
      label: "Resources",
      href: "/tools",
      gradient: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.06) 50%, rgba(185, 28, 28, 0) 100%)",
      iconColor: "text-red-500",
        hoverColor: "group-hover:text-red-500",
    },
  ]

  const settingsItem: MenuItem = {
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    href: "/settings",
    gradient: "radial-gradient(circle, rgba(156, 163, 175, 0.15) 0%, rgba(107, 114, 128, 0.06) 50%, rgba(75, 85, 99, 0) 100%)",
    iconColor: "text-slate-500",
    hoverColor: "group-hover:text-slate-500",
  };

  const profileItem: MenuItem = {
    icon: <User className="h-5 w-5" />,
    label: "Profile",
    href: "/profile",
    gradient: "radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, rgba(99, 102, 241, 0.06) 50%, rgba(79, 70, 229, 0) 100%)",
    iconColor: "text-indigo-500",
    hoverColor: "group-hover:text-indigo-500",
  };
  
    const icon = !hasMounted
    ? null
    : resolvedTheme === 'dark'
        ? <Moon className="h-5 w-5" />
        : <Sun className="h-5 w-5" />

    const themeItem: MenuItem = {
      icon,
      label: "Theme",
      href: "#",
      onClick: () => setTheme(isDarkTheme ? 'light' : 'dark'),
      gradient: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.06) 50%, rgba(217,119,6,0) 100%)",
      iconColor: "text-amber-500",
      hoverColor: isDarkTheme ? "group-hover:text-gray-400" : "group-hover:text-yellow-500",
    };


  const footerNavItems: MenuItem[] = [settingsItem, profileItem, themeItem];

  const handleLinkClick = (itemOnClick?: () => void) => {
    if (itemOnClick) {
      itemOnClick();
    }
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const renderNavItem = (item: MenuItem) => (
    <motion.li
      key={item.label}
      className={cn("relative w-full flex justify-center list-none", isExpanded && "px-3")}
    >
      <motion.div
        className="block rounded-xl group relative w-full" // Added 'group' here if not already for other purposes
        style={{ perspective: "600px" }}
        initial="initial"
        whileHover="hover"
        title={!isExpanded ? item.label : undefined} // Keep native title for accessibility/fallback
      >
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          variants={glowVariants}
          style={{
            background: item.gradient,
            opacity: 0,
            borderRadius: "16px",
          }}
        />
        <Link
          href={item.href}
          onClick={() => handleLinkClick(item.onClick)}
          className="w-full flex justify-center"
          aria-label={item.label}
        >
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent transition-colors rounded-xl w-full cursor-pointer text-muted-foreground",
              !isExpanded && "scale-110",
              item.hoverColor,
              isExpanded ? "justify-start" : "justify-center"
            )}
            variants={itemVariants}
            transition={sharedTransition}
            style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
          >
            <span
              className={cn(
                `transition-colors duration-300 group-hover:${item.iconColor} text-foreground`,
                !isExpanded && "scale-110"
              )}
            >
              {item.icon}
            </span>
            {isExpanded && <span>{item.label}{item.label === "Theme" && resolvedTheme && `: ${resolvedTheme.charAt(0).toUpperCase()}${resolvedTheme.slice(1)}`}</span>}
          </motion.div>
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent transition-colors rounded-xl w-full cursor-pointer text-muted-foreground",
              !isExpanded && "scale-110",
              item.hoverColor,
              isExpanded ? "justify-start" : "justify-center"
            )}
            variants={backVariants}
            transition={sharedTransition}
            style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
          >
            <span
              className={cn(
                `transition-colors duration-300 group-hover:${item.iconColor} text-foreground`,
                !isExpanded && "scale-110"
              )}
            >
              {item.icon}
            </span>
            {isExpanded && <span>{item.label}{item.label === "Theme" && resolvedTheme && `: ${resolvedTheme.charAt(0).toUpperCase()}${resolvedTheme.slice(1)}`}</span>}
          </motion.div>
        </Link>

        {/* Custom Animated Tooltip */}
        {!isExpanded && (
          <motion.div
            className="absolute left-[calc(100%+0.75rem)] top-1 -translate-y-1/2 p-1.5 px-3 bg-background border border-border rounded-md shadow-lg text-sm text-foreground whitespace-nowrap z-[60]"
            // left: 100% of parent width (64px for collapsed w-16) + 0.75rem (12px) margin
            // bg-background & border for a floating style, text-foreground for visibility.
            variants={customTooltipVariants}
            // This will automatically animate based on parent's 'initial' and 'hover' states
          >
            {item.label}
          </motion.div>
        )}
      </motion.div>
    </motion.li>
  );

  return (
    <motion.aside
      className={cn(
        "h-screen border-r border-border flex flex-col items-center py-6 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg fixed z-50 transition-all duration-300",
        isExpanded ? "w-48" : "w-16"
      )}
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className={"absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/30 via-30% via-purple-400/30 via-60% via-red-400/30 via-90% to-transparent rounded-3xl z-0 pointer-events-none"}
        variants={navGlowVariants}
      />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full mb-6 relative z-10"
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronRight
          className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")}
        />
      </Button>

      <nav className="flex flex-col w-full items-center gap-2 relative z-10">
        {menuItems.map(renderNavItem)}
      </nav>

      <div className="mt-auto flex flex-col w-full items-center gap-2 pt-4 pb-2 relative z-10">
        {footerNavItems.map(renderNavItem)}
      </div>

    </motion.aside>
  )
}