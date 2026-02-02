import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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
  const path = location.pathname.replace("/onboarding/", "") || "welcome";
  const stepIndex = STEPS.findIndex((s) => s.path === path);
  const progress = stepIndex < 0 ? 0 : ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
