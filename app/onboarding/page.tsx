"use client"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = (schedule: any) => {
    // Save the generated schedule to localStorage
    localStorage.setItem("schedule", JSON.stringify(schedule))
    localStorage.setItem("onboardingComplete", "true")
    localStorage.setItem("userProfile", JSON.stringify(schedule.userProfile))

    // Redirect to the main dashboard
    router.push("/")
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />
}
