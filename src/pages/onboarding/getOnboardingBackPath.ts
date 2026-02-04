import type { OnboardingMode } from "@/contexts/OnboardingContext";

/**
 * Returns the path to navigate to when user presses Back (or Left arrow).
 * Respects flow: e.g. Muslim users skip knowledge, so Back from health goes to mode.
 */
export function getOnboardingBackPath(
  stepPath: string,
  mode: OnboardingMode
): string | null {
  const step = stepPath.replace(/^\/onboarding\/?/, "") || "welcome";
  switch (step) {
    case "welcome":
      return null;
    case "mode":
      return "/onboarding/welcome";
    case "knowledge":
      // Knowledge is multi-step (quiz); the page handles Back / ArrowLeft itself
      return null;
    case "health":
      return mode === "muslim" ? "/onboarding/mode" : "/onboarding/knowledge";
    case "gender":
      return "/onboarding/health";
    case "location":
      return "/onboarding/gender";
    case "schedule":
      return "/onboarding/location";
    case "notifications":
      return "/onboarding/schedule";
    case "priorities":
      return "/onboarding/notifications";
    case "goals":
      return "/onboarding/priorities";
    default:
      return null;
  }
}
