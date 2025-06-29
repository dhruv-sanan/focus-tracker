import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

const TaskSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string(),
  category: z.enum(["Routine", "Inner Mastery", "Outer Mastery", "Work", "Break", "Wellbeing"]),
})

const ModifiedScheduleSchema = z.object({
  tasks: z.array(TaskSchema),
})

export async function POST(request: Request) {
  try {
    const { day, currentTasks, request: userRequest } = await request.json()

    const prompt = `Modify the ${day} schedule based on the user's request: "${userRequest}"

Current ${day} schedule:
${currentTasks
  .map((task: any) => `${task.startTime}-${task.endTime}: ${task.description} (${task.category})`)
  .join("\n")}

Instructions:
1. Modify the schedule according to the user's request
2. Keep the overall structure and flow logical
3. Ensure no time conflicts
4. Maintain appropriate categories for each task
5. Keep task IDs in format: ${day.toLowerCase().slice(0, 3)}XX (e.g., mon01, tue02)
6. Use 24-hour time format (HH:MM)
7. Make sure the modified schedule still makes sense for a typical day

Categories available:
- "Routine" for daily habits like meals, wake up, sleep prep
- "Inner Mastery" for meditation, journaling, reflection
- "Outer Mastery" for skill development, learning, projects
- "Work" for professional responsibilities
- "Break" for rest periods and transitions
- "Wellbeing" for fitness, health, and self-care

Return the complete modified task list for ${day}.`

    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: ModifiedScheduleSchema,
      prompt: prompt,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("Error modifying day schedule:", error)
    return Response.json({ error: "Failed to modify schedule" }, { status: 500 })
  }
}
