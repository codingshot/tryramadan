import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useUserPreferences, getQuickActionOrderFromPriorities } from "@/hooks/useLocalStorage";
import { useDashboardQuickActions } from "@/hooks/useLocalStorage";

const STEPS = [
  { path: "welcome", label: "Welcome" },
  { path: "mode", label: "Mode" },
  { path: "knowledge", label: "Knowledge" },
  { path: "health", label: "Health" },
  { path: "location", label: "Location" },
  { path: "schedule", label: "Schedule" },
  { path: "notifications", label: "Notifications" },
  { path: "priorities", label: "Priorities" },
  { path: "goals", label: "Goals" },
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useOnboarding();
  const [preferences, setPreferences] = useUserPreferences();
  const [, setQuickActionOrder] = useDashboardQuickActions();

  const path = location.pathname.replace("/onboarding/", "") || "welcome";
  const stepIndex = STEPS.findIndex((s) => s.path === path);
  const progress = stepIndex < 0 ? 0 : ((stepIndex + 1) / STEPS.length) * 100;

  const handleClose = () => {
    const priorities = state.priorities;
    setPreferences({
      ...preferences,
      userType: state.mode,
      experience: state.experience,
      location: state.location?.displayName ?? "",
      locationCoords: state.location ? { lat: state.location.lat, lng: state.location.lng } : null,
      timezone: state.location?.timezone ?? null,
      fastingGoal: state.selectedProgram === "traditional" ? "full" : state.selectedProgram,
      selectedProgram: state.selectedProgram,
      onboardingComplete: true,
      notificationsEnabled: state.notifications.suhoor || state.notifications.iftar,
      learningPriority: priorities.learningPriority,
      cultureRecipesPriority: priorities.cultureRecipesPriority,
      quranPriority: priorities.quranPriority,
      macroTrackingEnabled: priorities.macroTrackingEnabled,
      simplifyByLocation: priorities.simplifyByLocation,
    });
    setQuickActionOrder(getQuickActionOrderFromPriorities(priorities));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-end gap-2 px-4 py-2 bg-muted/30 border-b border-border">
        <span className="text-xs text-muted-foreground mr-auto">Setup</span>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Save and exit setup"
          title="Save answers and go to dashboard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="h-1 bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <main className="flex-1 container mx-auto px-4 max-w-lg min-w-0 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:pt-8 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
