export interface Task {
  id: string
  startTime: string
  endTime: string
  description: string
  category?: string
}

export interface DaySchedule {
  [day: string]: Task[]
}

export interface ScheduleData {
  schedule: DaySchedule
  settings?: {
    theme?: string
  }
}
