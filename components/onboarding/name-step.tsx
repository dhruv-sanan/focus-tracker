"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

interface NameStepProps {
  onSubmit: (name: string) => void
}

export function NameStep({ onSubmit }: NameStepProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to MyFocusDash</CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Let's create a personalized schedule that works for you
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What's your name?
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg py-3"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full py-3 text-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
              disabled={!name.trim()}
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
