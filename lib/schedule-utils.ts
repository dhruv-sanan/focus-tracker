// Helper functions for schedule management

export function saveScheduleToStorage(schedule: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("schedule", JSON.stringify(schedule))
  }
}

export function getScheduleFromStorage() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("schedule")
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function formatTimeForDisplay(time: string) {
  // Convert 24h format to 12h format with AM/PM
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export function validateTimeFormat(time: string) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export function compareTimeStrings(time1: string, time2: string) {
  // Compare two time strings in format "HH:MM"
  const [hours1, minutes1] = time1.split(":").map(Number)
  const [hours2, minutes2] = time2.split(":").map(Number)

  if (hours1 !== hours2) {
    return hours1 - hours2
  }
  return minutes1 - minutes2
}
