"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  const toggleTheme = () => {
    const currentIsDark = document.documentElement.classList.contains("dark")
    setTheme(currentIsDark ? "light" : "dark")
  }

  const isDarkAnimation = document.documentElement.classList.contains("dark") || theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 outline-none overflow-hidden transition-colors flex items-center justify-center w-9 h-9"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkAnimation ? "dark" : "light"}
          initial={{ y: -30, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDarkAnimation ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
