import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const TaskSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string(),
  category: z.enum(["Routine", "Inner Mastery", "Outer Mastery", "Work", "Break", "Wellbeing"]),
});

const ScheduleSchema = z.object({
  schedule: z.object({
    Monday: z.array(TaskSchema),
    Tuesday: z.array(TaskSchema),
    Wednesday: z.array(TaskSchema),
    Thursday: z.array(TaskSchema),
    Friday: z.array(TaskSchema),
    Saturday: z.array(TaskSchema),
    Sunday: z.array(TaskSchema),
  }),
});

export async function POST(request: Request) {
  try {
    const userProfile = await request.json();

    const prompt = `Create a comprehensive weekly schedule for ${userProfile.name} based on their preferences:

Personal Details:
- Wake up time: ${userProfile.wakeUpTime}
- Sleep time: ${userProfile.sleepTime}
- Work hours: ${userProfile.workStartTime} to ${userProfile.workEndTime}
- Work type: ${userProfile.workType}
- Priorities: ${userProfile.priorities.join(", ")}
- Fitness goals: ${userProfile.fitnessGoals}
- Personal goals: ${userProfile.personalGoals}
- Preferred time slots: ${userProfile.availableTimeSlots.join(", ")}

Create a balanced weekly schedule that includes:
1. Work blocks during their specified work hours
2. Morning and evening routines
3. Time for their priorities and goals
4. Regular breaks and meals
5. Fitness/wellness activities
6. Personal development time
7. Relaxation and wind-down time

Categories to use (MUST use exactly these values):
- "Routine" for daily habits like meals, wake up, sleep prep
- "Inner Mastery" for meditation, journaling, reflection
- "Outer Mastery" for skill development, learning, projects
- "Work" for professional responsibilities
- "Break" for rest periods and transitions
- "Wellbeing" for fitness, health, and self-care

Each task should have:
- Unique ID (format: first 3 letters of day + 2-digit number, like mon01, tue01, wed01, etc.)
- Start and end times in HH:MM format (24-hour)
- Clear, actionable description
- Appropriate category from the exact list above

Make the schedule realistic, balanced, and aligned with their goals and preferences.
Ensure all times are logical and sequential throughout each day.`;

    console.log("Prompt for schedule generation:", prompt);

    const result = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: ScheduleSchema,
      prompt: prompt,
      temperature: 0.3, // Lower temperature for more consistent formatting
    });

    console.log("Generated schedule:", result.object);
    return Response.json(result.object);
  } catch (error) {
    console.error("Error generating schedule:", error);
    return Response.json({ error: "Failed to generate schedule" }, { status: 500 });
  }
}